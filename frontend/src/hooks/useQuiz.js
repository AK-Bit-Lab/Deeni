import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { DEENI_QUIZ_ADDRESS, QUIZ_ABI } from "../constants";

// Number of quiz topics supported by the DeeniQuiz contract. Kept in
// sync with the contract's enum / mapping sizes. If a new topic is
// added on-chain, bump this and add a matching useBest call below.
const QUIZ_TOPIC_COUNT = 10;

// Centralised contract reference so the address/abi pair is only typed
// once. All reads and writes in this hook go through CONTRACT.
const CONTRACT = {
  address: DEENI_QUIZ_ADDRESS,
  abi: QUIZ_ABI,
};

/**
 * useQuiz
 * Reads on-chain quiz stats (best score per topic, total quizzes) for the
 * connected wallet and exposes a write helper to submit a quiz result (which
 * costs gas on Celo). All hooks are called unconditionally at the top level
 * (QUIZ_TOPIC_COUNT topics, fixed) to respect the Rules of Hooks.
 *
 * Returned shape:
 *   address      - connected wallet address (or undefined)
 *   stats        - array of length QUIZ_TOPIC_COUNT; each entry is
 *                  { id, bestScore, bestTotal, pct, attempts }
 *   totalQuizzes - lifetime total quizzes submitted by this wallet
 *   submitQuiz   - (topic, score, total, questionHash) => void - kicks
 *                  off the submitQuiz tx
 *   isPending    - true while the wallet is awaiting user confirmation
 *   isConfirming - true while the tx is mined but not yet confirmed
 *   isConfirmed  - true once the tx has confirmed on-chain
 *   error        - last write/confirm error, if any
 */
export function useQuiz() {
  const { address } = useAccount();

  const { data: totalQuizzes } = useReadContract({
    ...CONTRACT,
    functionName: "totalQuizzes",
    args: [address],
    query: { enabled: !!address },
  });

  // Unrolled best-score reads for topics 0..QUIZ_TOPIC_COUNT-1. The
  // unroll is intentional: a loop would call useBest conditionally,
  // which violates the Rules of Hooks.
  const b0 = useBest(address, 0);
  const b1 = useBest(address, 1);
  const b2 = useBest(address, 2);
  const b3 = useBest(address, 3);
  const b4 = useBest(address, 4);
  const b5 = useBest(address, 5);
  const b6 = useBest(address, 6);
  const b7 = useBest(address, 7);
  const b8 = useBest(address, 8);
  const b9 = useBest(address, 9);
  const bests = [b0, b1, b2, b3, b4, b5, b6, b7, b8, b9];

  const stats = bests.map((b, i) => ({
    id: i,
    bestScore: b.bestScore,
    bestTotal: b.bestTotal,
    pct: b.bestTotal > 0 ? Math.round((b.bestScore / b.bestTotal) * 100) : 0,
    attempts: b.attempts,
  }));

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const submitQuiz = (topic, score, total, questionHash) =>
    writeContract({
      ...CONTRACT,
      functionName: "submitQuiz",
      args: [topic, score, total, questionHash],
    });

  return {
    address,
    stats,
    totalQuizzes: totalQuizzes ? Number(totalQuizzes) : 0,
    submitQuiz,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Helper: read best score + attempts for a single topic.
function useBest(address, topic) {
  const { data } = useReadContract({
    ...CONTRACT,
    functionName: "getBest",
    args: [address, topic],
    query: { enabled: !!address },
  });
  return {
    bestScore: data ? Number(data[0]) : 0,
    bestTotal: data ? Number(data[1]) : 0,
    attempts: data ? Number(data[2]) : 0,
  };
}

/**
 * useQuizHistory
 * Reads a paginated page of quiz results for the connected wallet.
 */
export function useQuizHistory(offset = 0, limit = 20) {
  const { address } = useAccount();
  const { data, isLoading } = useReadContract({
    ...CONTRACT,
    functionName: "getResults",
    args: [address, offset, limit],
    query: { enabled: !!address },
  });

  const history = (data || []).map((r) => ({
    topic: Number(r.topic),
    score: Number(r.score),
    total: Number(r.total),
    questionHash: r.questionHash,
    timestamp: Number(r.timestamp),
  }));

  return { history, isLoading };
}
