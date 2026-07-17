import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Flame, CheckCircle2, Loader2 } from "lucide-react";
import { useDeeds } from "../hooks/useDeeds";
import { DEED_TYPES, DEENI_DEEDS_ADDRESS } from "../constants";

const DEEDS_ZERO = /^0x0+$/.test(DEENI_DEEDS_ADDRESS);

export default function DailyDeeds() {
  const { stats, totalDeeds, recordDeed, isPending, isConfirming, isConfirmed, error } =
    useDeeds();
  const [counts, setCounts] = useState({});
  const [activeId, setActiveId] = useState(null);

  const getCount = (id) => counts[id] ?? DEED_TYPES[id].defaultCount;

  const handleRecord = (deed) => {
    setActiveId(deed.id);
    recordDeed(deed.id, getCount(deed.id));
  };

  // Once the on-chain transaction is confirmed, the hook invalidates the
  // deed reads so stats refetch. Clear the active deed so the spinner stops
  // and the freshly-updated checkmark / count render.
  useEffect(() => {
    if (isConfirmed) setActiveId(null);
  }, [isConfirmed]);

  const doneTodayCount = stats.filter((s) => s.doneToday).length;
  const progress = Math.round((doneTodayCount / DEED_TYPES.length) * 100);

  return (
    <div className="p-5 max-w-md mx-auto pt-6">
      <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 mb-4">
        <ChevronLeft className="w-4 h-4" /> Home
      </Link>
      <h2 className="text-2xl font-extrabold text-emerald-800 mb-1">Daily Deeds</h2>
      <p className="text-gray-500 text-sm mb-5">
        Record your daily worship on-chain. Each entry is a Celo transaction — an
        immutable, verifiable log of your spiritual journey.
      </p>

      {DEEDS_ZERO && (
        <div className="mb-4 text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-100">
          ⚠️ Deeds contract not deployed yet. Deploy <code>DeeniDeeds.sol</code> and set
          its address in <code>constants/index.js</code> to enable on-chain recording.
        </div>
      )}

      {/* Progress */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Today's progress</span>
          <span className="text-sm font-bold text-emerald-700">
            {doneTodayCount}/{DEED_TYPES.length}
          </span>
        </div>
        <div className="h-2.5 bg-emerald-50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Total deeds recorded on-chain: {totalDeeds}
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
          {error.shortMessage || error.message}
        </div>
      )}
      {isConfirmed && (
        <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-xl">
          ✅ Deed recorded on-chain! Stats updated.
        </div>
      )}

      {/* Deed list */}
      <div className="space-y-3 pb-24">
        {DEED_TYPES.map((deed) => {
          const s = stats[deed.id];
          const busy = isPending && activeId === deed.id;
          return (
            <div
              key={deed.id}
              className={`bg-white rounded-2xl shadow-sm border p-4 transition-colors ${
                s.doneToday ? "border-emerald-300 bg-emerald-50" : "border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{deed.icon}</div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800 text-sm">{deed.label}</div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      {s.streak}d streak
                    </span>
                    <span>Best: {s.best}d</span>
                    <span>Total: {s.total} {deed.unit}</span>
                  </div>
                </div>
                {s.doneToday ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={getCount(deed.id)}
                      onChange={(e) =>
                        setCounts((c) => ({
                          ...c,
                          [deed.id]: Math.max(1, parseInt(e.target.value) || 1),
                        }))
                      }
                      disabled={DEEDS_ZERO}
                      className="w-16 px-2 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-400 outline-none disabled:opacity-50"
                    />
                    <button
                      onClick={() => handleRecord(deed)}
                      disabled={busy || DEEDS_ZERO}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      {busy && <Loader2 className="w-3 h-3 animate-spin" />}
                      {busy ? "…" : "Record"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center pb-24">
        Recording a deed sends an on-chain transaction on Celo. You pay a small gas fee
        for each entry, creating a permanent record of your worship.
      </p>
    </div>
  );
}
