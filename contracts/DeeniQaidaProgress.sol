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

    // user => array of all completed lesson logs (append-only)
    mapping(address => LessonLog[]) public logs;

    // user => lessonId => whether completed at least once
    mapping(address => mapping(uint8 => bool)) public completed;

    // user => highest lesson completed
    mapping(address => uint8) public highestLesson;

    // user => total completions (including repeats)
    mapping(address => uint256) public totalCompletions;

    event LessonCompleted(
        address indexed user,
        uint8   indexed lessonId,
        uint64  timestamp
    );

    /// @notice Record completion of a Qaida lesson on-chain.
    /// @param lessonId The lesson number (1-17).
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

    /// @notice Number of lesson logs stored for a user.
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

    /// @notice Returns a summary: highestLesson, totalCompletions, and whether
    /// a specific lesson is completed.
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