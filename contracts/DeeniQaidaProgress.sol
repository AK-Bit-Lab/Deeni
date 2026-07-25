// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title DeeniQaidaProgress
/// @notice On-chain Qaida (Arabic reading) lesson completion tracker.
///         Every time a user completes a lesson, they sign a transaction
///         on Celo to record it immutably. Unlike DeeniDeeds, there is no
///         "once per day" restriction — users can complete multiple lessons
///         in a single session.
contract DeeniQaidaProgress {
    struct LessonLog {
        uint8  lessonId;   // 1-17 (matches frontend QAIDA_LESSONS)
        // NOTE: timestamp is stored as uint64. Unix timestamps fit in uint64
        // until year 584,942,417,355 (~5.8e11 AD), well beyond any practical
        // horizon. uint64 was chosen over uint256 to pack the struct tightly
        // (1 byte lessonId + 8 bytes timestamp = 9 bytes, rounded to one
        // 32-byte storage slot) and save gas on SSTOREs.
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