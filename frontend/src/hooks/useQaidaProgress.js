import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { QAIDA_PROGRESS_ADDRESS, QAIDA_PROGRESS_ABI } from "../constants";

/**
 * useQaidaProgress
 * Reads on-chain Qaida lesson progress for the connected wallet and exposes
 * a write helper to record lesson completion (which costs gas on Celo).
 * Unlike DeeniDeeds, there is no "once per day" restriction - users can
 * complete multiple lessons in a single session.
 *
 * Returned shape:
 *   address          - connected wallet address (or undefined)
 *   highestLesson    - highest lesson id the user has completed (0 if none)
 *   totalCompletions - lifetime count of lesson completions (a user can
 *                      complete the same lesson multiple times; this counts
 *                      every completion, not just unique lessons)
 *   completeLesson   - (lessonId: number) => void - kicks off the
 *                      completeLesson tx
 *   txHash           - hash of the in-flight tx (or undefined)
 *   isPending        - true while the wallet is awaiting user confirmation
 *   isConfirming     - true while the tx is mined but not yet confirmed
 *   isConfirmed      - true once the tx has confirmed on-chain
 *   error            - last write/confirm error, if any
 */
export function useQaidaProgress() {
  const { address } = useAccount();

  // Read highest lesson completed
  const { data: highestLesson } = useReadContract({
    address: QAIDA_PROGRESS_ADDRESS,
    abi: QAIDA_PROGRESS_ABI,
    functionName: "highestLesson",
    args: [address],
    query: { enabled: !!address },
  });

  // Read total completions
  const { data: totalCompletions } = useReadContract({
    address: QAIDA_PROGRESS_ADDRESS,
    abi: QAIDA_PROGRESS_ABI,
    functionName: "totalCompletions",
    args: [address],
    query: { enabled: !!address },
  });

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const queryClient = useQueryClient();

  // After the completeLesson transaction is confirmed on-chain, invalidate all
  // qaida-progress-related reads so the UI refetches.
  useEffect(() => {
    if (!isConfirmed) return;
    queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        query.queryKey.some(
          (k) =>
            typeof k === "object" &&
            k !== null &&
            k.address === QAIDA_PROGRESS_ADDRESS
        ),
    });
  }, [isConfirmed, queryClient]);

  const completeLesson = (lessonId) =>
    writeContract({
      address: QAIDA_PROGRESS_ADDRESS,
      abi: QAIDA_PROGRESS_ABI,
      functionName: "completeLesson",
      args: [lessonId],
    });

  return {
    address,
    highestLesson: highestLesson ? Number(highestLesson) : 0,
    totalCompletions: totalCompletions ? Number(totalCompletions) : 0,
    completeLesson,
    txHash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}