import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { DEENI_SUBSCRIPTION_ADDRESS, DEENI_ABI } from "../constants";

/**
 * useSubscription
 * Reads the on-chain subscription state for the connected wallet and exposes
 * write helpers for starting the free trial and paying the 5 CELO fee.
 */
export function useSubscription() {
  const { address, isConnected } = useAccount();

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
