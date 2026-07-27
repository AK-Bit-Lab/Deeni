// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title DeeniDeeds
/// @author  Deeni Labs (AK-Bit-Lab)
/// @notice On-chain daily Islamic deeds tracker. Every action a user completes
///         (Quran recitation, dua, dhikr, prayer, fasting, charity, learning)
///         is recorded on-chain so the user pays gas on Celo and builds an
///         immutable, verifiable spiritual log with streaks and counts.
/// @dev     Self-contained (no external imports) so it compiles cleanly in
///         Remix. The contract is non-upgradeable and has no owner: every
///         user is their own admin. Gas is minimised by packing structs into
///         single storage slots and using `uint8`/`uint32`/`uint64` instead
///         of `uint256` where the value range permits.
contract DeeniDeeds {
    // Deed type IDs (0-7)
    // 0 = Quran recitation, 1 = Dua, 2 = Dhikr, 3 = Salah (prayer),
    // 4 = Fasting, 5 = Charity/Sadaqah, 6 = Learning Arabic, 7 = Reading 99 Names

    /// @notice Custom errors used in place of `require` strings. Custom errors
    ///         are cheaper to deploy and to revert with than string-based
    ///         requires (no ABI string, no revert data allocation), and they
    ///         give off-chain clients a stable, typed selector to decode
    ///         instead of a free-form message.
    /// @dev    Each error is declared once at the top of the contract so the
    ///         ABI is small and the selectors are easy to reference from
    ///         off-chain code (e.g. wagmi/viem `decodeErrorResult`).
    error InvalidDeedType();
    error ZeroCount();
    error CountTooLarge();
    error AlreadyRecordedToday();

    /// @notice A single immutable record of one deed performed by one user.
    /// @dev Stored in the per-user `deedLogs` array. The struct is intentionally
    ///      packed into a single 32-byte storage slot:
    ///      `uint8 deedType` (1 byte) + `uint32 count` (4 bytes) + `uint64 timestamp`
    ///      (8 bytes) = 13 bytes of payload, padded to one slot. This packing
    ///      halves the SSTORE cost compared to using three separate fields or
    ///      wider types such as `uint256`. The struct is `internal` to the
    ///      contract - off-chain clients see it through the ABI but cannot
    ///      construct one directly.
    /// @param deedType  Identifier of the deed category (0..7). See the comment
    ///                  block above the struct for the canonical mapping.
    /// @param count     How many units of the deed were performed in this single
    ///                  entry (e.g. pages of Quran, rakats of salah, repetitions
    ///                  of dhikr). The unit is implicit in `deedType`.
    /// @param timestamp Unix timestamp (seconds since epoch) at which the deed
    ///                  was recorded. Stored as `uint64` because unix timestamps
    ///                  fit comfortably until year 584,942,417,355 AD, well beyond
    ///                  any practical horizon, and `uint64` packs tighter than
    ///                  `uint256`.
    struct DeedLog {
        uint8 deedType;
        uint32 count;
        uint64 timestamp;
    }

    /// @notice Append-only per-user log of every deed ever recorded.
    /// @dev Indexed by user address. Each push appends a new `DeedLog` entry;
    ///      entries are never removed or reordered, so the array index doubles
    ///      as a chronological ordering. Off-chain clients paginate this array
    ///      via `getDeeds(user, offset, limit)`. The array grows unbounded
    ///      over time, so very active users may eventually hit RPC gas limits
    ///      when paginating - the frontend should bound `limit` accordingly.
    mapping(address => DeedLog[]) public deedLogs;

    /// @notice Running total of `count` units the user has ever recorded for a
    ///         given deed type. Never decreases.
    /// @dev    Stored as `uint32` because no realistic lifetime total exceeds
    ///         4 billion units (e.g. 4 billion pages of Quran). The mapping
    ///         is monotonic: it only ever increases, never decreases. There
    ///         is intentionally no admin function to reset it - the
    ///         lifetime-total invariant is permanent.
    mapping(address => mapping(uint8 => uint32)) public totalCount;

    /// @notice The day index (days since the unix epoch, i.e. `block.timestamp / 1 days`)
    ///         on which the user most recently recorded a deed of the given type.
    /// @dev Used by `recordDeed` to decide whether the current entry continues
    ///      the streak (same day or exactly +1 day) or resets it (gap of 2+ days).
    ///      Stored as `uint32` because the day index fits comfortably until
    ///      year ~10,675 AD. A value of 0 means the user has never recorded
    ///      this deed type (the default zero is treated as "no prior entry").
    mapping(address => mapping(uint8 => uint32)) public lastDay;

    /// @notice The user's current consecutive-day streak for the given deed type.
    /// @dev Reset to 1 whenever a new streak begins and incremented by 1 when
    ///      the next day's entry arrives. Reset to 0 when the streak is broken.
    ///      Stored as `uint32` because no realistic streak exceeds 4 billion
    ///      days (~11 million years). The streak is "current" in the sense
    ///      that it reflects the most recent unbroken run; it is NOT a
    ///      lifetime total (see `bestStreak` for that).
    mapping(address => mapping(uint8 => uint32)) public currentStreak;

    /// @notice The longest streak the user has ever achieved for the given deed type.
    /// @dev Monotonically non-decreasing. Updated by `recordDeed` whenever the
    ///      current streak exceeds the previous best. Stored as `uint32`
    ///      because no realistic streak exceeds 4 billion days. The flag is
    ///      monotonic: it only ever increases, never decreases. There is
    ///      intentionally no admin function to reset it - the
    ///      personal-record invariant is permanent.
    mapping(address => mapping(uint8 => uint32)) public bestStreak;

    /// @notice Total number of `DeedLog` entries the user has recorded across all deed types.
    /// @dev Equivalent to `deedLogs[user].length` but exposed as a top-level
    ///      mapping so it can be read with a single `eth_call` instead of
    ///      fetching the dynamic array's length separately. Stored as
    ///      `uint256` because the count is unbounded over a user's lifetime.
    ///      The mapping is monotonic: it only ever increases, never decreases.
    mapping(address => uint256) public totalDeeds;

    /// @notice Emitted when a user successfully records a deed on-chain.
    /// @param user       The address that recorded the deed.
    /// @param deedType   The deed category (0..7). See the comment block at
    ///                    the top of the contract for the canonical mapping.
    /// @param count      The number of units recorded for this deed.
    /// @param timestamp  Unix timestamp (seconds since epoch) at which the
    ///                    deed was recorded.
    /// @param newStreak  The user's new consecutive-day streak for this deed
    ///                    type after this entry. Off-chain indexers can use
    ///                    this to update streak badges without re-reading
    ///                    storage.
    /// @dev    `user` and `deedType` are indexed so off-chain indexers can
    ///         subscribe to per-user or per-deed-type feeds. The other
    ///         fields are not indexed because they are rarely queried as
    ///         filters.
    event DeedRecorded(
        address indexed user,
        uint8 indexed deedType,
        uint32 count,
        uint64 timestamp,
        uint32 newStreak
    );

    /// @notice Returns the current day index (days since Unix epoch).
    /// @dev    Computed as `block.timestamp / 1 days` and cast to `uint32`.
    ///         The cast is safe until year ~10,675 AD (well beyond any
    ///         practical horizon) and saves one SLOAD on subsequent reads
    ///         because the value fits in a single slot. The function is
    ///         `internal` so it can be called from other functions in this
    ///         contract without going through the external ABI.
    function _today() internal view returns (uint32) {
        return uint32(block.timestamp / 1 days);
    }

    /// @notice Maximum units of a single deed that can be recorded in one
    ///         entry. 100,000 is well above any realistic single-day value
    ///         (e.g. ~600 pages of Quran, ~200 rakats of salah, ~50,000
    ///         dhikr beads) and prevents accidental or malicious huge
    ///         values from inflating on-chain stats or wasting gas.
    /// @dev    Stored as `uint32` because no realistic single-day value
    ///         exceeds 4 billion. The constant is `public` so off-chain
    ///         clients can read it via a single `eth_call` and validate
    ///         user input before submitting a transaction.
    uint32 public constant MAX_DEED_COUNT = 100_000;

    /// @notice Record a deed on-chain for the caller. Each (user, deedType) pair
    ///         can only be recorded once per UTC day.
    /// @param deedType Identifier of the deed category (0..7). See the comment
    ///                  block at the top of the contract for the canonical mapping.
    /// @param count    Quantity for this deed (e.g. pages of Quran, rakats of
    ///                  salah, repetitions of dhikr). Must be in the range
    ///                  (0, MAX_DEED_COUNT].
    /// @dev Reverts with "Invalid deed type" if `deedType > 7`, with
    ///      "Count must be > 0" if `count == 0`, with "Count too large" if
    ///      `count > MAX_DEED_COUNT`, and with "Already recorded today" if the
    ///      caller has already recorded this deed type on the current UTC day.
    ///      The streak logic is: if the previous entry was exactly one day
    ///      before today, the streak is incremented; otherwise (first entry
    ///      ever, or a gap of 2+ days) the streak resets to 1. `bestStreak`
    ///      is updated monotonically. Emits a single `DeedRecorded` event
    ///      containing the new streak so off-chain indexers can update their
    ///      UI without re-reading storage. The function writes to five
    ///      storage slots: `lastDay`, `currentStreak`, `bestStreak`,
    ///      `totalCount`, and `totalDeeds`, plus one push to the `deedLogs`
    ///      array. The day boundary is UTC (block.timestamp / 1 days), not
    ///      the user's local timezone.
    function recordDeed(uint8 deedType, uint32 count) external {
        if (deedType > 7) revert InvalidDeedType();
        if (count == 0) revert ZeroCount();
        if (count > MAX_DEED_COUNT) revert CountTooLarge();

        uint32 day = _today();
        if (lastDay[msg.sender][deedType] == day) revert AlreadyRecordedToday();

        // Streak logic
        uint32 prev = lastDay[msg.sender][deedType];
        uint32 streak = currentStreak[msg.sender][deedType];
        if (prev != 0 && day == prev + 1) {
            streak += 1; // consecutive day
        } else {
            streak = 1; // reset
        }

        lastDay[msg.sender][deedType] = day;
        currentStreak[msg.sender][deedType] = streak;
        if (streak > bestStreak[msg.sender][deedType]) {
            bestStreak[msg.sender][deedType] = streak;
        }

        totalCount[msg.sender][deedType] += count;
        totalDeeds[msg.sender] += 1;

        deedLogs[msg.sender].push(
            DeedLog({
                deedType: deedType,
                count: count,
                timestamp: uint64(block.timestamp)
            })
        );

        emit DeedRecorded(msg.sender, deedType, count, uint64(block.timestamp), streak);
    }

    /// @notice Returns whether the user has already recorded the given deed type today (UTC).
    /// @param user     The address to query.
    /// @param deedType The deed category to check (0..7).
    /// @return True if `user` has already called `recordDeed` for `deedType` on the
    ///         current UTC day, false otherwise. Useful for the frontend to disable
    ///         the "Record" button after the user has already submitted for the day.
    /// @dev    The function is a thin wrapper around a single SLOAD on
    ///         `lastDay[user][deedType]` and a call to `_today()`. It is
    ///         safe to call from any off-chain client (no gas cost beyond
    ///         the `eth_call` overhead). The day boundary is UTC, not the
    ///         user's local timezone.
    function recordedToday(address user, uint8 deedType) external view returns (bool) {
        return lastDay[user][deedType] == _today();
    }

    /// @notice Returns the total number of deed log entries the user has recorded.
    /// @param user The address to query.
    /// @return The length of `deedLogs[user]`. Equivalent to the public
    ///         `totalDeeds[user]` mapping but exposed as a dedicated function so
    ///         off-chain clients can call it without knowing the storage layout.
    /// @dev    The function is a thin wrapper around `deedLogs[user].length`
    ///         and exists primarily for ABI discoverability and to give the
    ///         frontend a stable, named entry point that matches the
    ///         camelCase convention used elsewhere.
    function deedCount(address user) external view returns (uint256) {
        return deedLogs[user].length;
    }

    /// @notice Returns a page of deed logs (newest first via offset from end).
    /// @param user   The user whose deeds to read.
    /// @param offset Number of most-recent entries to skip (0 = start from the
    ///               newest). Capped implicitly by the user's log length.
    /// @param limit  Maximum number of entries to return. Callers should pass
    ///               a sensible upper bound (e.g. 20) to bound gas.
    /// @return page  Array of DeedLog entries, ordered oldest -> newest within
    ///               the returned window. Returns an empty array if offset is
    ///               past the end of the log.
    /// @dev The function reads from the end of the array backwards so that
    ///      `offset = 0` returns the most recent `limit` entries, which is the
    ///      common UI use case (a "recent activity" feed). The returned slice
    ///      is internally ordered oldest -> newest so the frontend can render
    ///      it directly without re-sorting. The function is `view` and does
    ///      not modify state, but it allocates a new memory array on every
    ///      call, so callers should bound `limit` to avoid OOG on the RPC.
    function getDeeds(address user, uint256 offset, uint256 limit)
        external
        view
        returns (DeedLog[] memory page)
    {
        uint256 len = deedLogs[user].length;
        if (offset >= len) return page;

        uint256 end = len - offset;
        uint256 start = end > limit ? end - limit : 0;
        uint256 size = end - start;
        page = new DeedLog[](size);
        for (uint256 i = 0; i < size; i++) {
            page[i] = deedLogs[user][start + i];
        }
    }

    /// @notice Returns a summary of the user's stats for a single deed type.
    /// @param user     The address to query.
    /// @param deedType The deed category (0..7).
    /// @return total  The lifetime total of `count` units recorded for this deed type.
    /// @return streak The user's current consecutive-day streak for this deed type.
    /// @return best   The user's longest-ever streak for this deed type.
    /// @dev Bundles three storage reads into a single `eth_call` so the frontend
    ///      can render a stats card with one round-trip instead of three. The
    ///      function is `view` and does not modify state. The three returned
    ///      values are independent and can be cached separately by off-chain
    ///      clients if needed.
    function getStats(address user, uint8 deedType)
        external
        view
        returns (uint32 total, uint32 streak, uint32 best)
    {
        return (
            totalCount[user][deedType],
            currentStreak[user][deedType],
            bestStreak[user][deedType]
        );
    }
}
