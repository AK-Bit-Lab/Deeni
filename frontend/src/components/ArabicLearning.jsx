import { useState } from "react";
import { Volume2, ChevronLeft, ChevronRight, BookOpen, CheckCircle2, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import { speak } from "../utils/speak";

/* ────────────────────────────────────────────────────────────
   Deeni — Quran Reading Curriculum
   Stage 1: The 28 Arabic letters (Huroof)
   Stage 2: Harakat — the short & long vowels (Fatha, Kasra, Damma, Sukun, Tanwin, Maddah)
   Stage 3: Tajweed basics — pronunciation rules (Ghunnah, Qalqalah, Idgham, Ikhfa, Madd)
   Stage 4: Joining letters — forming words from connected letters
   ──────────────────────────────────────────────────────────── */

// ── Stage 1: The 28 letters ──────────────────────────────────
const ARABIC_ALPHABET = [
  { letter: "ا", name: "Alif", translit: "ʾalif", phonetic: "alif" },
  { letter: "ب", name: "Baa", translit: "bāʾ", phonetic: "baa" },
  { letter: "ت", name: "Taa", translit: "tāʾ", phonetic: "taa" },
  { letter: "ث", name: "Thaa", translit: "thāʾ", phonetic: "thaa" },
  { letter: "ج", name: "Jeem", translit: "jīm", phonetic: "jeem" },
  { letter: "ح", name: "Haa", translit: "ḥāʾ", phonetic: "haa" },
  { letter: "خ", name: "Khaa", translit: "khāʾ", phonetic: "khaa" },
  { letter: "د", name: "Daal", translit: "dāl", phonetic: "daal" },
  { letter: "ذ", name: "Dhaal", translit: "dhāl", phonetic: "dhaal" },
  { letter: "ر", name: "Raa", translit: "rāʾ", phonetic: "raa" },
  { letter: "ز", name: "Zaa", translit: "zāy", phonetic: "zaa" },
  { letter: "س", name: "Seen", translit: "sīn", phonetic: "seen" },
  { letter: "ش", name: "Sheen", translit: "shīn", phonetic: "sheen" },
  { letter: "ص", name: "Saad", translit: "ṣād", phonetic: "saad" },
  { letter: "ض", name: "Daad", translit: "ḍād", phonetic: "daad" },
  { letter: "ط", name: "Taa", translit: "ṭāʾ", phonetic: "taa" },
  { letter: "ظ", name: "Zhaa", translit: "ẓāʾ", phonetic: "zhaa" },
  { letter: "ع", name: "Ayn", translit: "ʿayn", phonetic: "ayn" },
  { letter: "غ", name: "Ghayn", translit: "ghayn", phonetic: "ghayn" },
  { letter: "ف", name: "Faa", translit: "fāʾ", phonetic: "faa" },
  { letter: "ق", name: "Qaaf", translit: "qāf", phonetic: "qaaf" },
  { letter: "ك", name: "Kaaf", translit: "kāf", phonetic: "kaaf" },
  { letter: "ل", name: "Laam", translit: "lām", phonetic: "laam" },
  { letter: "م", name: "Meem", translit: "mīm", phonetic: "meem" },
  { letter: "ن", name: "Noon", translit: "nūn", phonetic: "noon" },
  { letter: "ه", name: "Haa", translit: "hāʾ", phonetic: "haa" },
  { letter: "و", name: "Waaw", translit: "wāw", phonetic: "waaw" },
  { letter: "ي", name: "Yaa", translit: "yāʾ", phonetic: "yaa" },
];

// ── Stage 2: Harakat (vowel marks) ──────────────────────────
const HARAKAT = [
  { mark: "بَ", name: "Fatha", desc: "Short 'a' sound — a small diagonal line above the letter.", example: "بَ = ba", phonetic: "ba" },
  { mark: "بِ", name: "Kasra", desc: "Short 'i' sound — a small diagonal line below the letter.", example: "بِ = bi", phonetic: "bi" },
  { mark: "بُ", name: "Damma", desc: "Short 'u' sound — a small curl above the letter.", example: "بُ = bu", phonetic: "bu" },
  { mark: "بْ", name: "Sukun", desc: "No vowel — a small circle above the letter. The consonant is pronounced without a following vowel.", example: "بْ = b (stop)", phonetic: "b" },
  { mark: "بً", name: "Tanwin Fath", desc: "Double fatha — 'an' sound at the end of a word.", example: "بً = ban", phonetic: "ban" },
  { mark: "بٍ", name: "Tanwin Kasr", desc: "Double kasra — 'in' sound at the end of a word.", example: "بٍ = bin", phonetic: "bin" },
  { mark: "بٌ", name: "Tanwin Damm", desc: "Double damma — 'un' sound at the end of a word.", example: "بٌ = bun", phonetic: "bun" },
  { mark: "آ", name: "Maddah", desc: "Long 'aa' — a tilde-shaped mark above Alif, extending the sound.", example: "آ = aa (long)", phonetic: "aa" },
  { mark: "بّ", name: "Shadda", desc: "Doubles the consonant — a small 'w' shape above. The letter is pronounced twice.", example: "بّ = bb", phonetic: "bb" },
];

// ── Stage 3: Tajweed basics ──────────────────────────────────
const TAJWEED_RULES = [
  {
    name: "Ghunnah (Nasalisation)",
    arabic: "غُنَّة",
    desc: "A nasal sound held for 2 beats. Occurs when a Noon or Meem has a Shadda, or when Noon Sakinah/ Tanwin meets Yaa or Waaw.",
    example: "إِنَّا — 'innaa' (hold the 'nn' through the nose)",
    phonetic: "innanaa",
  },
  {
    name: "Qalqalah (Echo / Bounce)",
    arabic: "قَلْقَلَة",
    desc: "A slight bounce/echo on the letters ق ط ب ج د (Qutb Jadin) when they have a Sukun. The sound bounces without adding a vowel.",
    example: "خَلَقْ — 'khalaq' (bounce on the q)",
    phonetic: "khalaq",
  },
  {
    name: "Idgham (Merging)",
    arabic: "إِدْغَام",
    desc: "When Noon Sakinah or Tanwin is followed by one of ي ر م ل و ن (Yarmalun), the Noon merges into the next letter.",
    example: "مَنْ يَعْمَلْ — 'many yaʿmal' (merge the n into y)",
    phonetic: "many yaʿmal",
  },
  {
    name: "Ikhfa (Hiding)",
    arabic: "إِخْفَاء",
    desc: "When Noon Sakinah or Tanwin is followed by any of the 15 Ikhfa letters, the Noon is hidden with a nasal sound for 2 beats.",
    example: "مِنْ قَبْلُ — 'min qablu' (soft nasal on the n)",
    phonetic: "min qablu",
  },
  {
    name: "Madd (Elongation)",
    arabic: "مَدّ",
    desc: "Stretching a vowel sound for 2 beats (some cases 4 or 6). Triggered by Alif, Waaw, Yaa after a matching short vowel, or by the Madd mark.",
    example: "قَالَ — 'qaala' (stretch the aa to 2 beats)",
    phonetic: "qaala",
  },
  {
    name: "Iqlab (Conversion)",
    arabic: "إِقْلَاب",
    desc: "When Noon Sakinah or Tanwin is followed by Baa (ب), the Noon converts to a hidden Meem with a nasal sound.",
    example: "مِنْ بَعْدِ — 'mim baʿdi' (n becomes m)",
    phonetic: "mim baʿdi",
  },
];

// ── Stage 4: Joining letters (word formation) ────────────────
const JOINING_EXAMPLES = [
  { word: "بَاب", parts: ["بَ", "ا", "ب"], meaning: "Door", phonetic: "baab", note: "Baa + Alif + Baa. Notice how Baa connects to Alif but the second Baa stands alone." },
  { word: "كِتَاب", parts: ["كِ", "تَ", "ا", "ب"], meaning: "Book", phonetic: "kitaab", note: "Kaaf + Taa + Alif + Baa. The first three connect, Baa is separate." },
  { word: "مَكْتَب", parts: ["مَ", "كْ", "تَ", "ب"], meaning: "Office / Desk", phonetic: "maktab", note: "Meem + Kaaf(sukun) + Taa + Baa. All connect together." },
  { word: "أَحَد", parts: ["أَ", "حَ", "د"], meaning: "One", phonetic: "ahad", note: "Hamza + Haa + Daal. Daal never connects to the next letter." },
  { word: "رَبّ", parts: ["رَ", "بّ"], meaning: "Lord", phonetic: "rabb", note: "Raa + Baa with Shadda (doubled). Hold the 'bb' for 2 beats." },
  { word: "نُور", parts: ["نُ", "و", "ر"], meaning: "Light", phonetic: "noor", note: "Noon + Waaw + Raa. Waaw acts as a long 'oo' vowel here." },
];

// Letters that do NOT connect to the following letter
const NON_CONNECTING = ["ا", "د", "ذ", "ر", "ز", "و"];

// speak() is imported from ../utils/speak (robust mobile-friendly speech helper)

// ── Stage definitions ─────────────────────────────────────────
const STAGES = [
  { id: 0, title: "The Letters", subtitle: "حُرُوف", desc: "Learn the 28 Arabic letters and their sounds.", icon: "🔤" },
  { id: 1, title: "Harakat (Vowels)", subtitle: "حَرَكَات", desc: "Short & long vowel marks that go above and below letters.", icon: " vowel" },
  { id: 2, title: "Tajweed Basics", subtitle: "تَجْوِيد", desc: "Rules for proper pronunciation during recitation.", icon: "📜" },
  { id: 3, title: "Joining Letters", subtitle: "تَرْكِيب", desc: "Connect letters to form and read words.", icon: "🔗" },
];

// ── Main component ────────────────────────────────────────────
export default function ArabicLearning() {
  const [stage, setStage] = useState(0);
  const [active, setActive] = useState(null);
  const [completed, setCompleted] = useState(() => {
    try {
      const saved = localStorage.getItem("deeni_quran_progress");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const markComplete = (stageId) => {
    if (completed.includes(stageId)) return;
    const next = [...completed, stageId];
    setCompleted(next);
    try {
      localStorage.setItem("deeni_quran_progress", JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const goStage = (id) => {
    setStage(id);
    setActive(null);
  };

  return (
    <div className="p-5 max-w-3xl mx-auto pt-6 pb-24">
      <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 mb-4">
        <ChevronLeft className="w-4 h-4" /> Home
      </Link>

      <h2 className="text-2xl font-extrabold text-emerald-800 mb-1">
        Learn to Read the Quran
      </h2>
      <p className="text-gray-500 text-sm mb-5">
        A step-by-step journey: letters → vowels → tajweed → reading words.
      </p>

      {/* Stage progress bar */}
      <div className="flex items-center gap-1.5 mb-6">
        {STAGES.map((s) => (
          <button
            key={s.id}
            onClick={() => goStage(s.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-semibold transition-all ${
              stage === s.id
                ? "bg-emerald-600 text-white shadow"
                : completed.includes(s.id)
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {completed.includes(s.id) ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Circle className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{s.title}</span>
            <span className="sm:hidden">{s.id + 1}</span>
          </button>
        ))}
      </div>

      {/* Stage content */}
      {stage === 0 && (
        <StageLetters active={active} setActive={setActive} />
      )}
      {stage === 1 && <StageHarakat active={active} setActive={setActive} />}
      {stage === 2 && <StageTajweed active={active} setActive={setActive} />}
      {stage === 3 && <StageJoining active={active} setActive={setActive} />}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 gap-3">
        <button
          onClick={() => stage > 0 && goStage(stage - 1)}
          disabled={stage === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 disabled:opacity-40 hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <div className="text-center">
          <div className="text-xs text-gray-400">
            Stage {stage + 1} of {STAGES.length}
          </div>
          <div className="text-sm font-semibold text-emerald-700">
            {STAGES[stage].title}
          </div>
        </div>

        {stage < STAGES.length - 1 ? (
          <button
            onClick={() => {
              markComplete(stage);
              goStage(stage + 1);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => markComplete(stage)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" /> Finish
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Stage 1: Letters ──────────────────────────────────────── */
function StageLetters({ active, setActive }) {
  const select = (item) => {
    setActive(item);
    speak(item.letter);
  };

  return (
    <div>
      <StageHeader
        icon="🔤"
        title="The 28 Arabic Letters"
        arabic="حُرُوف الهِجَائِيَّة"
        desc="Tap any letter to hear its pronunciation. Master each letter before moving to vowels."
      />
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {ARABIC_ALPHABET.map((item, idx) => (
          <button
            key={idx}
            onClick={() => select(item)}
            className={`bg-white rounded-2xl shadow-sm border p-4 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
              active && active.letter === item.letter
                ? "border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50"
                : "border-emerald-100 hover:bg-emerald-50"
            }`}
          >
            <div className="text-4xl font-arabic text-emerald-600 leading-none">
              {item.letter}
            </div>
            <div className="text-sm font-semibold text-gray-700 mt-1">
              {item.name}
            </div>
            <div className="text-xs text-gray-400 italic">{item.translit}</div>
          </button>
        ))}
      </div>
      <ActiveCard active={active} field="letter" />
    </div>
  );
}

/* ── Stage 2: Harakat ──────────────────────────────────────── */
function StageHarakat({ active, setActive }) {
  const select = (item) => {
    setActive(item);
    speak(item.mark);
  };

  return (
    <div>
      <StageHeader
        icon=" vowel"
        title="Harakat — Vowel Marks"
        arabic="حَرَكَات"
        desc="Harakat are the small marks above and below letters that give them their vowel sounds. Without them, Arabic letters have no vowel."
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {HARAKAT.map((item, idx) => (
          <button
            key={idx}
            onClick={() => select(item)}
            className={`bg-white rounded-2xl shadow-sm border p-4 flex flex-col items-center gap-1 transition-all active:scale-95 ${
              active && active.name === item.name
                ? "border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50"
                : "border-emerald-100 hover:bg-emerald-50"
            }`}
          >
            <div className="text-4xl font-arabic text-emerald-600 leading-none">
              {item.mark}
            </div>
            <div className="text-sm font-semibold text-gray-700 mt-1">
              {item.name}
            </div>
            <div className="text-xs text-gray-400">{item.example}</div>
          </button>
        ))}
      </div>

      {active && (
        <div className="mt-6 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-3xl p-6 text-center animate-fade-up">
          <div className="text-6xl font-arabic mb-3 leading-none">{active.mark}</div>
          <div className="text-xl font-bold">{active.name}</div>
          <p className="text-emerald-100 text-sm mt-2 mb-4">{active.desc}</p>
          <button
            onClick={() => speak(active.mark)}
            className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
          >
            <Volume2 className="w-4 h-4" /> Hear it
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Stage 3: Tajweed ──────────────────────────────────────── */
function StageTajweed({ active, setActive }) {
  const select = (item) => {
    setActive(item);
    speak(item.phonetic);
  };

  return (
    <div>
      <StageHeader
        icon="📜"
        title="Tajweed — Pronunciation Rules"
        arabic="أَحْكَام التَّجْوِيد"
        desc="Tajweed is the set of rules that governs proper pronunciation of letters and timing during recitation. This ensures you read the Quran accurately."
      />
      <div className="space-y-3">
        {TAJWEED_RULES.map((item, idx) => (
          <button
            key={idx}
            onClick={() => select(item)}
            className={`w-full text-left bg-white rounded-2xl shadow-sm border p-4 transition-all active:scale-[0.98] ${
              active && active.name === item.name
                ? "border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50"
                : "border-emerald-100 hover:bg-emerald-50"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">
                  {item.name}
                </span>
                <span className="text-lg font-arabic text-emerald-600">
                  {item.arabic}
                </span>
              </div>
              <Volume2 className="w-4 h-4 text-emerald-500 shrink-0" />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            <div className="mt-2 bg-emerald-50 rounded-lg px-3 py-1.5">
              <span className="text-sm font-arabic text-emerald-700">
                {item.example}
              </span>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="mt-5 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-3xl p-6 text-center animate-fade-up">
          <div className="text-3xl font-arabic mb-2">{active.arabic}</div>
          <div className="text-lg font-bold">{active.name}</div>
          <p className="text-emerald-100 text-sm mt-2 mb-4">{active.desc}</p>
          <button
            onClick={() => speak(active.phonetic)}
            className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
          >
            <Volume2 className="w-4 h-4" /> Hear example
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Stage 4: Joining letters ──────────────────────────────── */
function StageJoining({ active, setActive }) {
  const select = (item) => {
    setActive(item);
    speak(item.word);
  };

  return (
    <div>
      <StageHeader
        icon="🔗"
        title="Joining Letters — Reading Words"
        arabic="تَرْكِيب الكَلِمَات"
        desc="Arabic letters connect to form words. Most letters connect on both sides, but six letters (ا د ذ ر ز و) only connect to the letter before them, never after."
      />

      {/* Non-connecting letters reminder */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
        <div className="text-xs font-semibold text-amber-700 mb-2">
          Non-connecting letters (only join from the right):
        </div>
        <div className="flex gap-2 flex-wrap">
          {NON_CONNECTING.map((l, i) => (
            <span
              key={i}
              className="text-2xl font-arabic bg-white rounded-lg px-3 py-1 text-amber-700 border border-amber-200"
            >
              {l}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {JOINING_EXAMPLES.map((item, idx) => (
          <button
            key={idx}
            onClick={() => select(item)}
            className={`w-full text-left bg-white rounded-2xl shadow-sm border p-4 transition-all active:scale-[0.98] ${
              active && active.word === item.word
                ? "border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50"
                : "border-emerald-100 hover:bg-emerald-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-4xl font-arabic text-emerald-700">
                {item.word}
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-700">
                  {item.meaning}
                </div>
                <div className="text-xs text-gray-400 italic">
                  {item.phonetic}
                </div>
              </div>
            </div>
            {/* Show the letter breakdown */}
            <div className="flex items-center gap-1 flex-wrap mt-2">
              {item.parts.map((p, i) => (
                <span key={i} className="flex items-center">
                  <span className="text-xl font-arabic bg-emerald-50 rounded px-2 py-0.5 text-emerald-600 border border-emerald-100">
                    {p}
                  </span>
                  {i < item.parts.length - 1 && (
                    <span className="text-gray-300 mx-0.5">+</span>
                  )}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">{item.note}</p>
          </button>
        ))}
      </div>

      {active && (
        <div className="mt-6 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-3xl p-6 text-center animate-fade-up">
          <div className="text-6xl font-arabic mb-3 leading-none">
            {active.word}
          </div>
          <div className="text-xl font-bold">{active.meaning}</div>
          <div className="text-emerald-100 italic mb-2">"{active.phonetic}"</div>
          <p className="text-emerald-100 text-xs mb-4 max-w-sm mx-auto">
            {active.note}
          </p>
          <button
            onClick={() => speak(active.word)}
            className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
          >
            <Volume2 className="w-4 h-4" /> Pronounce word
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Shared sub-components ─────────────────────────────────── */
function StageHeader({ icon, title, arabic, desc }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-bold text-emerald-800">{title}</h3>
        <span className="text-lg font-arabic text-emerald-500">{arabic}</span>
      </div>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function ActiveCard({ active, field }) {
  if (!active) return null;
  return (
    <div className="mt-6 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-3xl p-6 text-center animate-fade-up">
      <div className="text-7xl font-arabic mb-3 leading-none">
        {active[field]}
      </div>
      <div className="text-xl font-bold">{active.name}</div>
      <div className="text-emerald-100 italic mb-4">{active.translit}</div>
      <button
        onClick={() => speak(active[field])}
        className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
      >
        <Volume2 className="w-4 h-4" /> Pronounce again
      </button>
    </div>
  );
}
