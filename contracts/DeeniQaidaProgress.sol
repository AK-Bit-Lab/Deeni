// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title DeeniQaidaProgress
/// @author  Deeni Labs (AK-Bit-Lab)
/// @notice On-chain Qaida (Arabic reading) lesson completion tracker.
///         Every time a user completes a lesson, they sign a transaction
///         on Celo to record it immutably. Unlike DeeniDeeds, there is no
///         "once per day" restriction — users can complete multiple lessons
///         in a single session.
/// @dev     Self-contained (no external imports) so it compiles cleanly in
///         Remix. The contract is non-upgradeable and has no owner: every
///         user is their own admin. Gas is minimised by packing structs into
///         single storage slots and using `uint8`/`uint64` instead of
///         `uint256` where the value range permits.
contract DeeniQaidaProgress {
    /// @notice A single immutable record of one Qaida lesson completion by one user.
    /// @dev Stored in the per-user `logs` array. The struct is intentionally
    ///      packed into a single 32-byte storage slot:
    ///      `uint8 lessonId` (1 byte) + `uint64 timestamp` (8 bytes) = 9 bytes
    ///      of payload, padded to one slot. This packing halves the SSTORE
    ///      cost compared to using wider types such as `uint256`.
    ///      The struct is `internal` to the contract - off-chain clients see
    ///      it through the ABI but cannot construct one directly. Because
    ///      Solidity auto-generates a getter for public mappings of struct
    ///      arrays, the struct fields are still readable via
    ///      `logs(user, index)` even though the struct itself is not marked
    ///      `public`.
    /// @param lessonId  Identifier of the completed lesson (1..17). Matches the
    ///                  `QAIDA_LESSONS` array in the frontend so off-chain
    ///                  clients can resolve the lesson title and content.
    /// @param timestamp Unix timestamp (seconds since epoch) at which the
    ///                  lesson was completed. Stored as `uint64` because unix
    ///                  timestamps fit comfortably until year 584,942,417,355
    ///                  AD, well beyond any practical horizon, and `uint64`
    ///                  packs tighter than `uint256`.
    struct LessonLog {
        uint8  lessonId;
        uint64 timestamp;
    }

    /// @notice Append-only per-user log of every lesson completion ever recorded.
    /// @dev Indexed by user address. Each push appends a new `LessonLog`
    ///      entry; entries are never removed or reordered, so the array
    ///      index doubles as a chronological ordering. Off-chain clients
    ///      paginate this array via `getLogs(user, offset, limit)`. The
    ///      array grows unbounded over time, so very active users may
    ///      eventually hit RPC gas limits when paginating - the frontend
    ///      should bound `limit` accordingly.
    mapping(address => LessonLog[]) public logs;

    /// @notice Whether the user has completed a given lesson at least once.
    /// @dev    Stored as `bool` (one slot per (user, lessonId) pair). The
    ///         flag is monotonic: it only ever flips from false to true,
    ///         never back. There is intentionally no admin function to
    ///         reset it - the "completed at least once" record is permanent.
    mapping(address => mapping(uint8 => bool)) public completed;

    /// @notice The highest lesson number the user has ever completed.
    /// @dev    Updated by `completeLesson` only when the new lessonId
    ///         exceeds the previous best. Stored as `uint8` because the
    ///         curriculum has at most 255 lessons (currently 17). The
    ///         value is monotonic: it only ever increases, never decreases.
    mapping(address => uint8) public highestLesson;

    /// @notice Total number of lesson completions the user has recorded,
    ///         including repeats of the same lesson.
    /// @dev    Equivalent to `logs[user].length` but exposed as a top-level
    ///         mapping so it can be read with a single `eth_call` instead
    ///         of fetching the dynamic array's length separately. Stored
    ///         as `uint256` because the count is unbounded over a user's
    ///         lifetime. The mapping is monotonic: it only ever increases,
    ///         never decreases.
    mapping(address => uint256) public totalCompletions;

    /// @notice Emitted when a user successfully completes a Qaida lesson on-chain.
    /// @param user      The address that completed the lesson.
    /// @param lessonId  The lesson number (1..17).
    /// @param timestamp Unix timestamp (seconds since epoch) at which the
    ///                   lesson was completed.
    /// @dev    `user` and `lessonId` are indexed so off-chain indexers can
    ///         subscribe to per-user or per-lesson feeds. The `timestamp`
    ///         field is not indexed because it is rarely queried as a filter.
    event LessonCompleted(
        address indexed user,
        uint8   indexed lessonId,
        uint64  timestamp
    );

    /// @notice Record completion of a Qaida lesson on-chain.
    /// @dev    Unlike `DeeniDeeds.recordDeed`, there is no "once per day"
    ///         restriction - users can complete multiple lessons in a single
    ///         session. The function writes to four storage slots:
    ///         `logs` (push), `completed`, `totalCompletions`, and
    ///         `highestLesson` (only if the new lessonId is greater).
    ///         Emits a single `LessonCompleted` event so off-chain indexers
    ///         can update their UI without re-reading storage.
    /// @param lessonId The lesson number (1-17).
    /// @dev    Reverts with "Invalid lesson ID" if `lessonId` is outside
    ///         the inclusive range [1, 17]. The lesson ID range is stable:
    ///         changing it would break every existing user's `completed`
    ///         and `highestLesson` history, so new lessons must be appended
    ///         at the next free index rather than re-using or re-ordering
    ///         existing ones.
    function completeLesson(uint8 lessonId) external {
        require(lessonId >= 1 && lessonId <= 17, "Invalid lesson ID");

        logs[msg.sender].push(
            LessonLog({
                lessonId: lessonId,
                timestamp: uint64(block.timestamp)
            })
        );

        completed[msg.sender][lessonId] = true;
        totalCompletions[msg.sender] += 1;

        if (lessonId > highestLesson[msg.sender]) {
            highestLesson[msg.sender] = lessonId;
        }

        emit LessonCompleted(msg.sender, lessonId, uint64(block.timestamp));
    }

    /// @notice Returns the total number of lesson logs stored for a user.
    /// @param user The address to query.
    /// @return The length of `logs[user]`. Equivalent to the public
    ///         `totalCompletions[user]` mapping but exposed as a dedicated
    ///         function so off-chain clients can call it without knowing
    ///         the storage layout.
    /// @dev    The function is a thin wrapper around `logs[user].length`
    ///         and exists primarily for ABI discoverability and to give
    ///         the frontend a stable, named entry point that matches the
    ///         camelCase convention used elsewhere.
    function logCount(address user) external view returns (uint256) {
        return logs[user].length;
    }

    /// @notice Returns a page of lesson logs (newest first via offset from end).
    /// @param user   The user whose lesson history to read.
    /// @param offset Number of most-recent entries to skip (0 = start from the
    ///               newest). Capped implicitly by the user's log length.
    /// @param limit  Maximum number of entries to return. Callers should pass
    ///               a sensible upper bound (e.g. 20) to bound gas.
    /// @return page  Array of LessonLog entries, ordered oldest -> newest
    ///               within the returned window. Returns an empty array if
    ///               offset is past the end of the log.
    /// @dev The function reads from the end of the array backwards so that
    ///      `offset = 0` returns the most recent `limit` entries, which is the
    ///      common UI use case (a "recent lessons" feed). The returned slice
    ///      is internally ordered oldest -> newest so the frontend can render
    ///      it directly without re-sorting. The function is `view` and does
    ///      not modify state, but it allocates a new memory array on every
    ///      call, so callers should bound `limit` to avoid OOG on the RPC.
    function getLogs(address user, uint256 offset, uint256 limit)
        external
        view
        returns (LessonLog[] memory page)
    {
        uint256 len = logs[user].length;
        if (offset >= len) return page;

        uint256 end = len - offset;
        uint256 start = end > limit ? end - limit : 0;
        uint256 size = end - start;
        page = new LessonLog[](size);
        for (uint256 i = 0; i < size; i++) {
            page[i] = logs[user][start + i];
        }
    }

    /// @notice Returns a summary of the user's Qaida progress.
    /// @param user     The address to query.
    /// @param lessonId The lesson number (1..17) to check completion for.
    /// @return highest     The user's highest lesson number ever completed.
    /// @return total       The user's total number of lesson completions
    ///                      (including repeats).
    /// @return isCompleted True if the user has completed `lessonId` at
    ///                      least once, false otherwise.
    /// @dev Bundles three storage reads into a single `eth_call` so the
    ///      frontend can render a progress card with one round-trip
    ///      instead of three. The function is `view` and does not modify
    ///      state. The three returned values are independent and can be
    ///      cached separately by off-chain clients if needed.
    function getProgress(address user, uint8 lessonId)
        external
        view
        returns (uint8 highest, uint256 total, bool isCompleted)
    {
        return (
            highestLesson[user],
            totalCompletions[user],
            completed[user][lessonId]
        );
    }
}