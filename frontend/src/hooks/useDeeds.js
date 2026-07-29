import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { DEENI_DEEDS_ADDRESS, DEEDS_ABI } from "../constants";

// Number of deed types supported by the DeeniDeeds contract. Kept in
// sync with the contract's enum / mapping sizes. If a new deed type is
// added on-chain, bump this and add a matching useDeedReads call below.
const DEED_TYPE_COUNT = 8;

// Centralised contract reference so the address/abi pair is only typed
// once. All reads and writes in this hook go through CONTRACT.
const CONTRACT = {
  address: DEENI_DEEDS_ADDRESS,
  abi: DEEDS_ABI,
};

// Predicate that matches any TanStack Query cache entry produced by a
// useReadContract call against the deeds contract. Used to invalidate
// the right keys after a write confirms.
const isDeedsReadQuery = (query) =>
  Array.isArray(query.queryKey) &&
  query.queryKey.some(
    (k) =>
      typeof k === "object" &&
      k !== null &&
      k.address === CONTRACT.address
  );

// Helper to read stats + "recorded today" for a single deed type id.
function useDeedReads(address, id) {
  const stats = useReadContract({
    ...CONTRACT,
    functionName: "getStats",
    args: [address, id],
    query: { enabled: !!address },
  });
  const today = useReadContract({
    ...CONTRACT,
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
 * at the top level (DEED_TYPE_COUNT deed types, fixed) to respect the Rules of
 * Hooks.
 *
 * Returned shape:
 *   address     - connected wallet address (or undefined)
 *   stats       - array of length DEED_TYPE_COUNT; each entry is
 *                 { id, total, streak, best, doneToday }
 *   totalDeeds  - lifetime total deeds recorded by this wallet
 *   recordDeed  - (deedType: number, count: number) => void - kicks off
 *                 the recordDeed tx
 *   isPending   - true while the wallet is awaiting user confirmation
 *   isConfirming - true while the tx is mined but not yet confirmed
 *   isConfirmed - true once the tx has confirmed on-chain
 *   error       - last write/confirm error, if any
 */
export function useDeeds() {
  const { address } = useAccount();

  const { data: totalDeeds } = useReadContract({
    ...CONTRACT,
    functionName: "totalDeeds",
    args: [address],
    query: { enabled: !!address },
  });

  // Unrolled reads for deed types 0..DEED_TYPE_COUNT-1. The unroll is
  // intentional: a loop would call useDeedReads conditionally, which
  // violates the Rules of Hooks.
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
    queryClient.invalidateQueries({ predicate: isDeedsReadQuery });
  }, [isConfirmed, queryClient]);

  const recordDeed = (deedType, count) =>
    writeContract({
      ...CONTRACT,
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
