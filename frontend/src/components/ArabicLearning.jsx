import { useState } from "react";
import { Volume2, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

// Full 28-letter Arabic alphabet with transliteration and a phonetic
// spelling used for speech synthesis fallback.
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

function speak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  // Try to use an Arabic voice if available, otherwise fall back to default.
  const voices = window.speechSynthesis.getVoices();
  const ar = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("ar"));
  if (ar) utter.voice = ar;
  utter.rate = 0.8;
  utter.lang = ar ? ar.lang : "ar-SA";
  window.speechSynthesis.speak(utter);
}

export default function ArabicLearning() {
  const [active, setActive] = useState(null);

  const select = (item) => {
    setActive(item);
    speak(item.letter);
  };

  return (
    <div className="p-5 max-w-3xl mx-auto pt-6">
      <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 mb-4">
        <ChevronLeft className="w-4 h-4" /> Home
      </Link>
      <h2 className="text-2xl font-extrabold text-emerald-800 mb-1">
        Learn the Arabic Alphabet
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Tap any letter to hear how it is pronounced. 28 letters from Alif to Yaa.
      </p>

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

      {active && (
        <div className="mt-6 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-3xl p-6 text-center animate-fade-up">
          <div className="text-7xl font-arabic mb-3 leading-none">
            {active.letter}
          </div>
          <div className="text-xl font-bold">{active.name}</div>
          <div className="text-emerald-100 italic mb-4">{active.translit}</div>
          <button
            onClick={() => speak(active.letter)}
            className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
          >
            <Volume2 className="w-4 h-4" /> Pronounce again
          </button>
        </div>
      )}
    </div>
  );
}
