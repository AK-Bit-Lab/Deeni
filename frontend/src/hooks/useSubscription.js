import { useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { parseEther } from "viem";
import { DEENI_SUBSCRIPTION_ADDRESS, DEENI_ABI } from "../constants";

/**
 * useSubscription
 * Reads the on-chain subscription state for the connected wallet and exposes
 * write helpers for starting the free trial and paying the 5 CELO fee.
 */
export function useSubscription() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const { data: isSubscribed, isLoading: subLoading } = useReadContract({
    address: DEENI_SUBSCRIPTION_ADDRESS,
    abi: DEENI_ABI,
    functionName: "isSubscribed",
    args: [address],
    query: { enabled: !!address },
  });

  const { data: expiry } = useReadContract({
    address: DEENI_SUBSCRIPTION_ADDRESS,
    abi: DEENI_ABI,
    functionName: "getExpiry",
    args: [address],
    query: { enabled: !!address },
  });

  const { data: trialClaimed } = useReadContract({
    address: DEENI_SUBSCRIPTION_ADDRESS,
    abi: DEENI_ABI,
    functionName: "trialClaimed",
    args: [address],
    query: { enabled: !!address },
  });

  const { writeContract, data: txHash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  // When a subscription tx confirms, refetch the subscription reads so the
  // UI updates without a full page reload. We invalidate on every new txHash
  // (not just isConfirmed) so subsequent transactions also trigger a refetch.
  useEffect(() => {
    if (!isConfirmed || !txHash) return;
    queryClient.invalidateQueries({
      predicate: (q) =>
        Array.isArray(q.queryKey) &&
        q.queryKey[0]?.toLowerCase() === "readcontract" &&
        typeof q.queryKey[1]?.address === "string" &&
        q.queryKey[1].address.toLowerCase() ===
          DEENI_SUBSCRIPTION_ADDRESS.toLowerCase(),
    });
  }, [isConfirmed, txHash, queryClient]);

  const startTrial = () =>
    writeContract({
      address: DEENI_SUBSCRIPTION_ADDRESS,
      abi: DEENI_ABI,
      functionName: "startFreeTrial",
    });

  const paySubscription = () =>
    writeContract({
      address: DEENI_SUBSCRIPTION_ADDRESS,
      abi: DEENI_ABI,
      functionName: "paySubscription",
      value: parseEther("5"),
    });

  return {
    address,
    isConnected,
    isSubscribed: !!isSubscribed,
    expiry: expiry ? Number(expiry) : 0,
    trialClaimed: !!trialClaimed,
    subLoading,
    startTrial,
    paySubscription,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
