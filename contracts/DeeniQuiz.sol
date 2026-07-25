// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title DeeniQuiz
/// @notice On-chain Islamic knowledge test recorder. When a user finishes a quiz
///         (Quran, Tajweed, Pillars of Islam, Prophets, Fiqh, Seerah, etc.) the
///         result is committed on-chain so it is immutable, verifiable, and the
///         user builds a permanent learning record on Celo.
///
///         The quiz questions and grading happen off-chain in the frontend; this
///         contract only stores the final score so gas stays low. A cheap hash of
///         the questions is optionally stored for tamper-evidence.
contract DeeniQuiz {
    // Topic IDs (0-9) — kept as uint8 so the frontend can map freely.
    // 0 = Quran, 1 = Tajweed, 2 = Arabic Letters, 3 = Pillars of Islam,
    // 4 = Pillars of Iman, 5 = Prophets (Anbiya), 6 = Seerah,
    // 7 = Fiqh / Salah, 8 = Hadith, 9 = General Knowledge

    struct QuizResult {
        uint8   topic;       // 0-9
        uint16  score;       // correct answers
        uint16  total;        // total questions
        bytes32 questionHash; // keccak of question IDs (optional, zero allowed)
        // NOTE: timestamp is stored as uint64. Unix timestamps fit in uint64
        // until year 584,942,417,355 (~5.8e11 AD), well beyond any practical
        // horizon. uint64 was chosen over uint256 to pack the struct tightly
        // (1 + 2 + 2 + 32 + 8 = 45 bytes, rounded to two 32-byte storage
        // slots) and save gas on SSTOREs.
        uint64  timestamp;
    }

    // user => array of all quiz results (append-only)
    mapping(address => QuizResult[]) public results;

    // user => topic => best score (correct answers)
    mapping(address => mapping(uint8 => uint16)) public bestScore;

    // user => topic => best total (so a % can be computed)
    mapping(address => mapping(uint8 => uint16)) public bestTotal;

    // user => topic => number of attempts
    mapping(address => mapping(uint8 => uint32)) public attempts;

    // user => total quizzes taken
    mapping(address => uint256) public totalQuizzes;

    event QuizSubmitted(
        address indexed user,
        uint8   indexed topic,
        uint16  score,
        uint16  total,
        bytes32 questionHash,
        uint64  timestamp
    );

    /// @notice Submit a quiz result on-chain.
    /// @param topic        0-9 (see contract header).
    /// @param score        number of correct answers.
    /// @param total        total number of questions.
    /// @param questionHash keccak256 of the question IDs (or bytes32(0) to skip).
    function submitQuiz(
        uint8   topic,
        uint16  score,
        uint16  total,
        bytes32 questionHash
    ) external {
        require(topic <= 9, "Invalid topic");
        require(total > 0, "Total must be > 0");
        require(score <= total, "Score > total");

        results[msg.sender].push(
            QuizResult({
                topic: topic,
                score: score,
                total: total,
                questionHash: questionHash,
                timestamp: uint64(block.timestamp)
            })
        );

        attempts[msg.sender][topic] += 1;
        totalQuizzes[msg.sender] += 1;

        // Track best score (by raw correct count, then by percentage tiebreak).
        // On a tie (same correct count), prefer the attempt with the higher
        // percentage, i.e. the one with the SMALLER total (fewer questions
        // answered correctly out of a smaller pool = higher %).
        if (score > bestScore[msg.sender][topic]) {
            bestScore[msg.sender][topic] = score;
            bestTotal[msg.sender][topic] = total;
        } else if (
            score == bestScore[msg.sender][topic] &&
            bestTotal[msg.sender][topic] == 0
        ) {
            // First-ever tie on a brand-new topic: record the total so the
            // percentage can be computed. Without this, bestTotal stays 0
            // and the UI shows 0% even after a correct submission.
            bestTotal[msg.sender][topic] = total;
        } else if (
            score == bestScore[msg.sender][topic] &&
            total < bestTotal[msg.sender][topic] &&
            bestTotal[msg.sender][topic] > 0
        ) {
            // Same correct count on a shorter quiz => higher %, update total.
            bestTotal[msg.sender][topic] = total;
        }

        emit QuizSubmitted(msg.sender, topic, score, total, questionHash, uint64(block.timestamp));
    }

    /// @notice Number of quiz results stored for a user.
    function resultCount(address user) external view returns (uint256) {
        return results[user].length;
    }

    /// @notice Returns a page of quiz results (newest first via offset from end).
    function getResults(address user, uint256 offset, uint256 limit)
        external
        view
        returns (QuizResult[] memory page)
    {
        uint256 len = results[user].length;
        if (offset >= len) return page;

        uint256 end = len - offset;
        uint256 start = end > limit ? end - limit : 0;
        uint256 size = end - start;
        page = new QuizResult[](size);
        for (uint256 i = 0; i < size; i++) {
            page[i] = results[user][start + i];
        }
    }

    /// @notice Returns best score + total + attempts for a topic.
    function getBest(address user, uint8 topic)
        external
        view
        returns (uint16 bestS, uint16 bestT, uint32 tries)
    {
        return (
            bestScore[user][topic],
            bestTotal[user][topic],
            attempts[user][topic]
        );
    }
}
