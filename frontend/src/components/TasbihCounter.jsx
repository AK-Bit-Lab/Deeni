import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, CheckCircle2, Vibrate } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Preset dhikr phrases                                                */
/* ------------------------------------------------------------------ */
const DHIKR_PRESETS = [
  {
    id: "subhanallah",
    arabic: "سُبْحَانَ اللَّه",
    translit: "Subhanallah",
    meaning: "Glory be to Allah",
    target: 33,
  },
  {
    id: "alhamdulillah",
    arabic: "الْحَمْدُ لِلَّه",
    translit: "Alhamdulillah",
    meaning: "All praise is for Allah",
    target: 33,
  },
  {
    id: "allahuakbar",
    arabic: "اللَّهُ أَكْبَر",
    translit: "Allahu Akbar",
    meaning: "Allah is the Greatest",
    target: 34,
  },
  {
    id: "lailahaillallah",
    arabic: "لَا إِلَٰهَ إِلَّا اللَّه",
    translit: "La ilaha illallah",
    meaning: "There is no god but Allah",
    target: 100,
  },
  {
    id: "astaghfirullah",
    arabic: "أَسْتَغْفِرُ اللَّه",
    translit: "Astaghfirullah",
    meaning: "I seek forgiveness from Allah",
    target: 100,
  },
  {
    id: "salawat",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّد",
    translit: "Allahumma salli ala Muhammad",
    meaning: "O Allah, send blessings upon Muhammad ﷺ",
    target: 100,
  },
];

const TARGET_OPTIONS = [33, 99, 100, 1000];

const STORAGE_KEY = "deeni_tasbih";

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function TasbihCounter() {
  const [presetId, setPresetId] = useState("subhanallah");
  const [target, setTarget] = useState(33);
  const [count, setCount] = useState(0);
  const [totalCycles, setTotalCycles] = useState(0);
  const [totalCount, setTotalCount] = useState(0); // all-time across sessions
  const [vibrateOn, setVibrateOn] = useState(true);
  const [pulse, setPulse] = useState(false);
  const [showCycleComplete, setShowCycleComplete] = useState(false);
  const pulseTimer = useRef(null);

  const preset = DHIKR_PRESETS.find((p) => p.id === presetId) || DHIKR_PRESETS[0];

  // Load saved state
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (saved.presetId) setPresetId(saved.presetId);
      if (saved.target) setTarget(saved.target);
      if (saved.totalCount) setTotalCount(saved.totalCount);
      if (typeof saved.vibrateOn === "boolean") setVibrateOn(saved.vibrateOn);
    } catch {
      /* ignore */
    }
  }, []);

  // Persist state
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ presetId, target, totalCount, vibrateOn })
    );
  }, [presetId, target, totalCount, vibrateOn]);

  // Clear any pending pulse/cycle timers when the component unmounts, so
  // setState is never called after unmount (avoids React warnings and a
  // small memory leak if the user navigates away mid-animation).
  const cycleTimer = useRef(null);
  useEffect(() => {
    return () => {
      clearTimeout(pulseTimer.current);
      clearTimeout(cycleTimer.current);
    };
  }, []);

  const tap = () => {
    const newCount = count + 1;
    setCount(newCount);
    setTotalCount((t) => t + 1);

    // haptic feedback
    if (vibrateOn && navigator.vibrate) {
      navigator.vibrate(newCount % target === 0 ? 80 : 15);
    }

    // pulse animation
    setPulse(true);
    clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => setPulse(false), 150);

    // cycle complete
    if (newCount >= target) {
      setTotalCycles((c) => c + 1);
      setCount(0);
      setShowCycleComplete(true);
      clearTimeout(cycleTimer.current);
      cycleTimer.current = setTimeout(() => setShowCycleComplete(false), 1500);
    }
  };

  const reset = () => {
    setCount(0);
    setTotalCycles(0);
  };

  const selectPreset = (p) => {
    setPresetId(p.id);
    setTarget(p.target);
    setCount(0);
    setTotalCycles(0);
  };

  const progress = Math.min((count / target) * 100, 100);
  const remaining = target - count;

  return (
    <div className="p-5 pt-8 max-w-md mx-auto min-h-screen flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Link to="/" className="flex items-center gap-2 text-gray-500 text-sm">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <button
          onClick={() => setVibrateOn((v) => !v)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
            vibrateOn
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-gray-200 bg-white text-gray-400"
          }`}
        >
          <Vibrate className="w-3.5 h-3.5" />
          {vibrateOn ? "Vibrate on" : "Vibrate off"}
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg">
          <span className="text-2xl">📿</span>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-deeni-dark leading-none">Tasbih Counter</h1>
          <p className="text-gray-500 text-xs">Tap to count your dhikr</p>
        </div>
      </div>

      {/* Dhikr display */}
      <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white rounded-2xl p-5 mb-4 shadow-md text-center">
        <p lang="ar" dir="rtl" className="font-quran text-3xl mb-2 leading-snug">{preset.arabic}</p>
        <p className="text-teal-100 text-sm font-semibold">{preset.translit}</p>
        <p className="text-teal-200/70 text-xs mt-0.5">{preset.meaning}</p>
      </div>

      {/* Preset selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {DHIKR_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => selectPreset(p)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
              p.id === presetId
                ? "border-teal-500 bg-teal-50 text-teal-800"
                : "border-gray-200 bg-white text-gray-500"
            }`}
          >
            {p.translit}
          </button>
        ))}
      </div>

      {/* Target selector */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs text-gray-400 font-medium">Target:</span>
        {TARGET_OPTIONS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTarget(t);
              setCount(0);
              setTotalCycles(0);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold border ${
              t === target
                ? "border-teal-500 bg-teal-500 text-white"
                : "border-gray-200 bg-white text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Counter circle - the main tap target */}
      <div className="flex-1 flex flex-col items-center justify-center mb-4">
        <button
          onClick={tap}
          className={`relative w-64 h-64 rounded-full flex flex-col items-center justify-center shadow-xl transition-all active:scale-95 select-none ${
            pulse
              ? "bg-gradient-to-br from-teal-400 to-emerald-500 scale-105"
              : "bg-gradient-to-br from-teal-500 to-emerald-700"
          }`}
        >
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="4"
            />
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 46}`}
              strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
              className="transition-all duration-200"
            />
          </svg>

          {/* Count */}
          <span className="text-7xl font-extrabold text-white leading-none relative z-10">
            {count}
          </span>
          <span className="text-teal-100 text-sm font-medium relative z-10 mt-1">
            of {target}
          </span>
          <span className="text-teal-200/70 text-xs relative z-10 mt-0.5">
            {remaining > 0 ? `${remaining} to go` : "complete!"}
          </span>
        </button>

        {/* Cycle complete toast */}
        {showCycleComplete && (
          <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-sm animate-fadeUp">
            <CheckCircle2 className="w-5 h-5" />
            Cycle complete! Mashallah 🎉
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
          <div className="text-2xl font-extrabold text-deeni-dark">{totalCycles}</div>
          <div className="text-[10px] text-gray-400">cycles this session</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
          <div className="text-2xl font-extrabold text-deeni-dark">
            {totalCycles * target + count}
          </div>
          <div className="text-[10px] text-gray-400">this session</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
          <div className="text-2xl font-extrabold text-deeni-dark">{totalCount}</div>
          <div className="text-[10px] text-gray-400">all-time count</div>
        </div>
      </div>

      {/* Reset button */}
      <button
        onClick={reset}
        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm active:scale-95"
      >
        <RotateCcw className="w-4 h-4" /> Reset counter
      </button>

      <p className="text-center text-[10px] text-gray-400 mt-3">
        Tap the circle to count. Counts are saved on your device.
      </p>
    </div>
  );
}
