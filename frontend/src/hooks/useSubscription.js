import { useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { parseEther } from "viem";
import { DEENI_SUBSCRIPTION_ADDRESS, DEENI_ABI } from "../constants";

// Subscription fee in CELO. Kept in sync with SUBSCRIPTION_FEE on the
// DeeniSubscription contract. If the on-chain fee ever changes, update
// this constant in lockstep so the UI sends the correct value.
const SUBSCRIPTION_FEE_CELO = "5";

// Centralised contract reference so the address/ABI pair is only typed
// once. All reads and writes in this hook go through CONTRACT.
const CONTRACT = {
  address: DEENI_SUBSCRIPTION_ADDRESS,
  abi: DEENI_ABI,
};

// Predicate that matches any TanStack Query cache entry produced by a
// useReadContract call against the subscription contract. Used to
// invalidate the right keys after a write confirms.
const isSubscriptionReadQuery = (q) =>
  Array.isArray(q.queryKey) &&
  q.queryKey[0]?.toLowerCase() === "readcontract" &&
  typeof q.queryKey[1]?.address === "string" &&
  q.queryKey[1].address.toLowerCase() === CONTRACT.address.toLowerCase();

/**
 * useSubscription
 * Reads the on-chain subscription state for the connected wallet and exposes
 * write helpers for starting the free trial and paying the subscription fee.
 *
 * Returned shape:
 *   address        - connected wallet address (or undefined)
 *   isConnected    - true when a wallet is connected
 *   isSubscribed   - true when the connected wallet currently has an active
 *                    subscription (expiry > now)
 *   expiry         - subscription expiry as a unix timestamp in seconds (0
 *                    when not subscribed)
 *   trialClaimed   - true when the connected wallet has already used its
 *                    one-time free trial
 *   subLoading     - true while the initial reads are in flight
 *   startTrial     - () => void - kicks off the startFreeTrial tx
 *   paySubscription - () => void - kicks off the paySubscription tx with the
 *                    correct CELO value attached
 *   isPending      - true while the wallet is awaiting user confirmation
 *   isConfirming   - true while the tx is mined but not yet confirmed
 *   isConfirmed    - true once the tx has confirmed on-chain
 *   error          - last write/confirm error, if any
 */
export function useSubscription() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const { data: isSubscribed, isLoading: subLoading } = useReadContract({
    ...CONTRACT,
    functionName: "isSubscribed",
    args: [address],
    query: { enabled: !!address },
  });

  const { data: expiry } = useReadContract({
    ...CONTRACT,
    functionName: "getExpiry",
    args: [address],
    query: { enabled: !!address },
  });

  const { data: trialClaimed } = useReadContract({
    ...CONTRACT,
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
    queryClient.invalidateQueries({ predicate: isSubscriptionReadQuery });
  }, [isConfirmed, txHash, queryClient]);

  const startTrial = () =>
    writeContract({
      ...CONTRACT,
      functionName: "startFreeTrial",
    });

  const paySubscription = () =>
    writeContract({
      ...CONTRACT,
      functionName: "paySubscription",
      value: parseEther(SUBSCRIPTION_FEE_CELO),
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
