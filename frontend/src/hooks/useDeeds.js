import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { DEENI_DEEDS_ADDRESS, DEEDS_ABI } from "../constants";

// Helper to read stats + "recorded today" for a single deed type id.
function useDeedReads(address, id) {
  const stats = useReadContract({
    address: DEENI_DEEDS_ADDRESS,
    abi: DEEDS_ABI,
    functionName: "getStats",
    args: [address, id],
    query: { enabled: !!address },
  });
  const today = useReadContract({
    address: DEENI_DEEDS_ADDRESS,
    abi: DEEDS_ABI,
    functionName: "recordedToday",
    args: [address, id],
    query: { enabled: !!address },
  });
  const s = stats.data;
  return {
    total: s ? Number(s[0]) : 0,
    streak: s ? Number(s[1]) : 0,
    best: s ? Number(s[2]) : 0,
    doneToday: !!today.data,
  };
}

/**
 * useDeeds
 * Reads on-chain deed stats for the connected wallet and exposes a write helper
 * to record a deed (which costs gas on Celo). All hooks are called unconditionally
 * at the top level (8 deed types, fixed) to respect the Rules of Hooks.
 */
export function useDeeds() {
  const { address } = useAccount();

  const { data: totalDeeds } = useReadContract({
    address: DEENI_DEEDS_ADDRESS,
    abi: DEEDS_ABI,
    functionName: "totalDeeds",
    args: [address],
    query: { enabled: !!address },
  });

  // Unrolled reads for deed types 0-7
  const r0 = useDeedReads(address, 0);
  const r1 = useDeedReads(address, 1);
  const r2 = useDeedReads(address, 2);
  const r3 = useDeedReads(address, 3);
  const r4 = useDeedReads(address, 4);
  const r5 = useDeedReads(address, 5);
  const r6 = useDeedReads(address, 6);
  const r7 = useDeedReads(address, 7);
  const reads = [r0, r1, r2, r3, r4, r5, r6, r7];

  const stats = reads.map((r, i) => ({
    id: i,
    ...r,
  }));

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const queryClient = useQueryClient();

  // After the recordDeed transaction is confirmed on-chain, invalidate all
  // deed-related reads so the stats / "doneToday" / totalDeeds refetch and
  // the UI updates immediately (progress count, streak, checkmark, etc.).
  useEffect(() => {
    if (!isConfirmed) return;
    queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        query.queryKey.some(
          (k) =>
            typeof k === "object" &&
            k !== null &&
            k.address === DEENI_DEEDS_ADDRESS
        ),
    });
  }, [isConfirmed, queryClient]);

  const recordDeed = (deedType, count) =>
    writeContract({
      address: DEENI_DEEDS_ADDRESS,
      abi: DEEDS_ABI,
      functionName: "recordDeed",
      args: [deedType, count],
    });

  return {
    address,
    stats,
    totalDeeds: totalDeeds ? Number(totalDeeds) : 0,
    recordDeed,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
