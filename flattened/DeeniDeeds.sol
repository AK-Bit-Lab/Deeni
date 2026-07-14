// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title DeeniDeeds
/// @notice On-chain daily Islamic deeds tracker. Every action a user completes
///         (Quran recitation, dua, dhikr, prayer, fasting, charity, learning)
///         is recorded on-chain so the user pays gas on Celo and builds an
///         immutable, verifiable spiritual log with streaks and counts.
contract DeeniDeeds {
    // Deed type IDs (0-7)
    // 0 = Quran recitation, 1 = Dua, 2 = Dhikr, 3 = Salah (prayer),
    // 4 = Fasting, 5 = Charity/Sadaqah, 6 = Learning Arabic, 7 = Reading 99 Names

    struct DeedLog {
        uint8 deedType;
        uint32 count;      // how many units (e.g. pages, rakats, repetitions)
        uint64 timestamp;
    }

    // user => array of all deed logs
    mapping(address => DeedLog[]) public deedLogs;

    // user => deedType => total count ever
    mapping(address => mapping(uint8 => uint32)) public totalCount;

    // user => deedType => last day recorded (days since epoch)
    mapping(address => mapping(uint8 => uint32)) public lastDay;

    // user => deedType => current streak (consecutive days)
    mapping(address => mapping(uint8 => uint32)) public currentStreak;

    // user => deedType => best streak ever
    mapping(address => mapping(uint8 => uint32)) public bestStreak;

    // user => total deeds recorded
    mapping(address => uint256) public totalDeeds;

    event DeedRecorded(
        address indexed user,
        uint8 indexed deedType,
        uint32 count,
        uint64 timestamp,
        uint32 newStreak
    );

    /// @notice Returns the current day index (days since Unix epoch).
    function _today() internal view returns (uint32) {
        return uint32(block.timestamp / 1 days);
    }

    /// @notice Record a deed on-chain. Can only be recorded once per deed type per day.
    /// @param deedType 0-7 (see contract header).
    /// @param count    quantity for this deed (e.g. pages of Quran, rakats).
    function recordDeed(uint8 deedType, uint32 count) external {
        require(deedType <= 7, "Invalid deed type");
        require(count > 0, "Count must be > 0");

        uint32 day = _today();
        require(lastDay[msg.sender][deedType] != day, "Already recorded today");

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

    /// @notice Whether the user already recorded this deed today.
    function recordedToday(address user, uint8 deedType) external view returns (bool) {
        return lastDay[user][deedType] == _today();
    }

    /// @notice Total number of deed logs for a user.
    function deedCount(address user) external view returns (uint256) {
        return deedLogs[user].length;
    }

    /// @notice Returns a page of deed logs (newest first via offset from end).
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

    /// @notice Returns a summary: totalCount, currentStreak, bestStreak for a deed type.
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
