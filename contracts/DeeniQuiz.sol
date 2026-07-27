// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title DeeniQuiz
/// @author  Deeni Labs (AK-Bit-Lab)
/// @notice On-chain Islamic knowledge test recorder. When a user finishes a quiz
///         (Quran, Tajweed, Pillars of Islam, Prophets, Fiqh, Seerah, etc.) the
///         result is committed on-chain so it is immutable, verifiable, and the
///         user builds a permanent learning record on Celo.
///
///         The quiz questions and grading happen off-chain in the frontend; this
///         contract only stores the final score so gas stays low. A cheap hash of
///         the questions is optionally stored for tamper-evidence.
/// @dev     Self-contained (no external imports) so it compiles cleanly in
///         Remix. The contract is non-upgradeable and has no owner: every
///         user is their own admin. Gas is minimised by packing structs into
///         two storage slots and using `uint8`/`uint16`/`uint64` instead of
///         `uint256` where the value range permits.
contract DeeniQuiz {
    /// @notice Canonical mapping of `uint8` topic IDs to quiz categories.
    /// @dev Kept as `uint8` so the frontend can map freely without worrying
    ///      about gas. The IDs are stable: changing them would break every
    ///      existing user's `bestScore`/`bestTotal`/`attempts` history, so
    ///      new topics must be appended at the next free index rather than
    ///      re-using or re-ordering existing ones.
    ///      0 = Quran, 1 = Tajweed, 2 = Arabic Letters, 3 = Pillars of Islam,
    ///      4 = Pillars of Iman, 5 = Prophets (Anbiya), 6 = Seerah,
    ///      7 = Fiqh / Salah, 8 = Hadith, 9 = General Knowledge.
    // Topic IDs (0-9) — kept as uint8 so the frontend can map freely.
    // 0 = Quran, 1 = Tajweed, 2 = Arabic Letters, 3 = Pillars of Islam,
    // 4 = Pillars of Iman, 5 = Prophets (Anbiya), 6 = Seerah,
    // 7 = Fiqh / Salah, 8 = Hadith, 9 = General Knowledge

    /// @notice Custom errors used in place of `require` strings. Custom errors
    ///         are cheaper to deploy and to revert with than string-based
    ///         requires (no ABI string, no revert data allocation), and they
    ///         give off-chain clients a stable, typed selector to decode
    ///         instead of a free-form message.
    /// @dev    Each error is declared once at the top of the contract so the
    ///         ABI is small and the selectors are easy to reference from
    ///         off-chain code (e.g. wagmi/viem `decodeErrorResult`).
    error InvalidTopic();
    error ZeroTotal();
    error ScoreExceedsTotal();

    /// @notice Highest valid topic ID. The quiz curriculum currently has
    ///         10 topics (0..9); this constant is the inclusive upper bound
    ///         used by `submitQuiz` to validate input.
    /// @dev    Stored as `uint8` because the curriculum has at most 255
    ///         topics. The constant is `public` so off-chain clients can
    ///         read it via a single `eth_call` and validate user input
    ///         before submitting a transaction. The value is intentionally
    ///         fixed at deployment time - changing it would require a
    ///         contract upgrade, which this contract does not support.
    uint8 public constant MAX_TOPIC = 9;

    /// @notice A single immutable record of one quiz attempt by one user.
    /// @dev Stored in the per-user `results` array. The struct is intentionally
    ///      packed into two 32-byte storage slots:
    ///      slot 0 = `uint8 topic` (1) + `uint16 score` (2) + `uint16 total` (2)
    ///               + `bytes32 questionHash` (32) = 37 bytes (padded to 64);
    ///      slot 1 = `uint64 timestamp` (8) padded to 32.
    ///      Using `uint16` for score/total and `uint64` for the timestamp keeps
    ///      the struct compact and saves gas on SSTOREs compared to using
    ///      `uint256` everywhere. The struct is `internal` to the contract -
    ///      off-chain clients see it through the ABI but cannot construct one
    ///      directly. Because Solidity auto-generates a getter for public
    ///      mappings of struct arrays, the struct fields are still readable
    ///      via `results(user, index)` even though the struct itself is not
    ///      marked `public`.
    /// @param topic         Identifier of the quiz topic (0..9). See the comment
    ///                      block above the struct for the canonical mapping.
    /// @param score         Number of questions the user answered correctly.
    /// @param total         Total number of questions in the quiz. The percentage
    ///                      score is `score * 100 / total`.
    /// @param questionHash  Optional keccak256 hash of the question IDs that were
    ///                      asked, used as tamper-evidence. May be left as the
    ///                      zero hash if the caller does not want to commit to a
    ///                      specific question set.
    /// @param timestamp     Unix timestamp (seconds since epoch) at which the
    ///                      result was submitted. Stored as `uint64` because unix
    ///                      timestamps fit comfortably until year 584,942,417,355
    ///                      AD, well beyond any practical horizon.
    struct QuizResult {
        uint8   topic;
        uint16  score;
        uint16  total;
        bytes32 questionHash;
        uint64  timestamp;
    }

    /// @notice Append-only per-user log of every quiz attempt ever submitted.
    /// @dev Indexed by user address. Each push appends a new `QuizResult` entry;
    ///      entries are never removed or reordered, so the array index doubles
    ///      as a chronological ordering. Off-chain clients paginate this array
    ///      via `getResults(user, offset, limit)`.
    mapping(address => QuizResult[]) public results;

    /// @notice The user's best (highest) raw score ever achieved for a given topic.
    /// @dev Updated by `submitQuiz` only when the new attempt's score exceeds the
    ///      previous best. Stored as `uint16` because no quiz has more than
    ///      65,535 questions.
    mapping(address => mapping(uint8 => uint16)) public bestScore;

    /// @notice The `total` value paired with `bestScore` so the percentage can
    ///         be reconstructed off-chain as `bestScore * 100 / bestTotal`.
    /// @dev Stored alongside `bestScore` because the same attempt that set the
    ///      best score also defines the denominator for that score.
    mapping(address => mapping(uint8 => uint16)) public bestTotal;

    /// @notice Number of quiz attempts the user has made for a given topic.
    /// @dev Incremented on every successful `submitQuiz` call regardless of
    ///      whether the score was a new best. Useful for the frontend to show
    ///      "5 attempts, best 8/10" style stats.
    mapping(address => mapping(uint8 => uint32)) public attempts;

    /// @notice Total number of quiz attempts the user has made across all topics.
    /// @dev Equivalent to `results[user].length` but exposed as a top-level
    ///      mapping so it can be read with a single `eth_call` instead of
    ///      fetching the dynamic array's length separately.
    mapping(address => uint256) public totalQuizzes;

    event QuizSubmitted(
        address indexed user,
        uint8   indexed topic,
        uint16  score,
        uint16  total,
        bytes32 questionHash,
        uint64  timestamp
    );

    /// @notice Submit a quiz result on-chain for the caller.
    /// @dev The quiz questions and grading happen entirely off-chain in the
    ///      frontend; this contract only stores the final score so gas stays
    ///      low. The optional `questionHash` provides tamper-evidence: an
    ///      auditor can recompute the hash from the question IDs and verify
    ///      that the recorded result corresponds to the claimed question set.
    /// @param topic        Identifier of the quiz topic (0..9). See the comment
    ///                     block at the top of the contract for the canonical
    ///                     mapping.
    /// @param score        Number of questions the user answered correctly.
    ///                     Must satisfy `0 <= score <= total`.
    /// @param total        Total number of questions in the quiz. Must be > 0.
    /// @param questionHash keccak256 hash of the question IDs that were asked,
    ///                     or `bytes32(0)` to skip the tamper-evidence check.
    /// @dev Reverts with "Invalid topic" if `topic > 9`, with "Total must be > 0"
    ///      if `total == 0`, and with "Score > total" if `score > total`.
    ///      The best-score tracking prefers higher raw scores; on a tie it
    ///      prefers the attempt with the higher percentage (i.e. the smaller
    ///      `total`). A special case records `bestTotal` on the very first
    ///      submission for a topic so the UI can show a non-zero percentage.
    ///      Emits a single `QuizSubmitted` event so off-chain indexers can
    ///      update their UI without re-reading storage.
    function submitQuiz(
        uint8   topic,
        uint16  score,
        uint16  total,
        bytes32 questionHash
    ) external {
        if (topic > MAX_TOPIC) revert InvalidTopic();
        if (total == 0) revert ZeroTotal();
        if (score > total) revert ScoreExceedsTotal();

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

    /// @notice Returns the total number of quiz results stored for a user.
    /// @param user The address to query.
    /// @return The length of `results[user]`. Equivalent to the public
    ///         `totalQuizzes[user]` mapping but exposed as a dedicated function
    ///         so off-chain clients can call it without knowing the storage layout.
    function resultCount(address user) external view returns (uint256) {
        return results[user].length;
    }

    /// @notice Returns a page of quiz results (newest first via offset from end).
    /// @param user   The user whose quiz history to read.
    /// @param offset Number of most-recent entries to skip (0 = start from the
    ///               newest). Capped implicitly by the user's result count.
    /// @param limit  Maximum number of entries to return. Callers should pass
    ///               a sensible upper bound (e.g. 20) to bound gas.
    /// @return page  Array of QuizResult entries, ordered oldest -> newest
    ///               within the returned window. Returns an empty array if
    ///               offset is past the end of the history.
    /// @dev The function reads from the end of the array backwards so that
    ///      `offset = 0` returns the most recent `limit` entries, which is the
    ///      common UI use case (a "recent quizzes" feed). The returned slice
    ///      is internally ordered oldest -> newest so the frontend can render
    ///      it directly without re-sorting.
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

    /// @notice Returns the user's best score, paired total, and attempt count for a topic.
    /// @param user  The address to query.
    /// @param topic The quiz topic (0..9).
    /// @return bestS The user's best raw score for this topic.
    /// @return bestT The `total` value paired with `bestS`, so the percentage
    ///               can be reconstructed as `bestS * 100 / bestT`.
    /// @return tries The total number of attempts the user has made for this topic.
    /// @dev Bundles three storage reads into a single `eth_call` so the frontend
    ///      can render a "best score" card with one round-trip instead of three.
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
