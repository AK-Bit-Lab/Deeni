import { useState } from "react";
import { Volume2, ChevronLeft, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { speak } from "../utils/speak";

// ── Complete Linear Qaida Curriculum ─────────────────────────
const QAIDA_LESSONS = [
  {
    id: 1,
    title: "Lesson 1: Alphabet",
    subtitle: "حُرُوف الهِجَائِيَّة",
    desc: "Learn the isolated Arabic letters.",
    words: [
      { text: "ا", phonetic: "alif" },
      { text: "ب", phonetic: "baa" },
      { text: "ت", phonetic: "taa" },
      { text: "ث", phonetic: "thaa" },
      { text: "ج", phonetic: "jeem" },
      { text: "ح", phonetic: "haa" },
      { text: "خ", phonetic: "khaa" },
      { text: "د", phonetic: "daal" },
      { text: "ذ", phonetic: "dhaal" },
      { text: "ر", phonetic: "raa" },
      { text: "ز", phonetic: "zaa" },
      { text: "س", phonetic: "seen" },
      { text: "ش", phonetic: "sheen" },
      { text: "ص", phonetic: "saad" },
      { text: "ض", phonetic: "daad" },
      { text: "ط", phonetic: "taa" },
      { text: "ظ", phonetic: "zhaa" },
      { text: "ع", phonetic: "ayn" },
      { text: "غ", phonetic: "ghayn" },
      { text: "ف", phonetic: "faa" },
      { text: "ق", phonetic: "qaaf" },
      { text: "ك", phonetic: "kaaf" },
      { text: "ل", phonetic: "laam" },
      { text: "م", phonetic: "meem" },
      { text: "ن", phonetic: "noon" },
      { text: "و", phonetic: "waaw" },
      { text: "ه", phonetic: "haa" },
      { text: "لا", phonetic: "laam alif" },
      { text: "ء", phonetic: "hamza" },
      { text: "ي", phonetic: "yaa" }
    ]
  },
  {
    id: 2,
    title: "Lesson 2: Fatha",
    subtitle: "حَرَكَة الفَتْحَة",
    desc: "Letters with the Fatha (short 'a') mark.",
    words: [
      { text: "اَ", phonetic: "a" },
      { text: "بَ", phonetic: "ba" },
      { text: "تَ", phonetic: "ta" },
      { text: "ثَ", phonetic: "tha" },
      { text: "جَ", phonetic: "ja" },
      { text: "حَ", phonetic: "ha" },
      { text: "خَ", phonetic: "kha" },
      { text: "دَ", phonetic: "da" },
      { text: "ذَ", phonetic: "dha" },
      { text: "رَ", phonetic: "ra" },
      { text: "زَ", phonetic: "za" },
      { text: "سَ", phonetic: "sa" },
      { text: "شَ", phonetic: "sha" },
      { text: "صَ", phonetic: "sa" },
      { text: "ضَ", phonetic: "da" },
      { text: "طَ", phonetic: "ta" },
      { text: "ظَ", phonetic: "za" },
      { text: "عَ", phonetic: "a" },
      { text: "غَ", phonetic: "gha" },
      { text: "فَ", phonetic: "fa" },
      { text: "قَ", phonetic: "qa" },
      { text: "كَ", phonetic: "ka" },
      { text: "لَ", phonetic: "la" },
      { text: "مَ", phonetic: "ma" },
      { text: "نَ", phonetic: "na" },
      { text: "وَ", phonetic: "wa" },
      { text: "هَ", phonetic: "ha" },
      { text: "لاَ", phonetic: "laa" },
      { text: "ءَ", phonetic: "a" },
      { text: "يَ", phonetic: "ya" }
    ]
  },
  {
    id: 3,
    title: "Lesson 3: Kasra",
    subtitle: "حَرَكَة الكَسْرَة",
    desc: "Letters with the Kasra (short 'i') mark.",
    words: [
      { text: "اِ", phonetic: "i" },
      { text: "بِ", phonetic: "bi" },
      { text: "تِ", phonetic: "ti" },
      { text: "ثِ", phonetic: "thi" },
      { text: "جِ", phonetic: "ji" },
      { text: "حِ", phonetic: "hi" },
      { text: "خِ", phonetic: "khi" },
      { text: "دِ", phonetic: "di" },
      { text: "ذِ", phonetic: "dhi" },
      { text: "رِ", phonetic: "ri" },
      { text: "زِ", phonetic: "zi" },
      { text: "سِ", phonetic: "si" },
      { text: "شِ", phonetic: "shi" },
      { text: "صِ", phonetic: "si" },
      { text: "ضِ", phonetic: "di" },
      { text: "طِ", phonetic: "ti" },
      { text: "ظِ", phonetic: "zi" },
      { text: "عِ", phonetic: "i" },
      { text: "غِ", phonetic: "ghi" },
      { text: "فِ", phonetic: "fi" },
      { text: "قِ", phonetic: "qi" },
      { text: "كِ", phonetic: "ki" },
      { text: "لِ", phonetic: "li" },
      { text: "مِ", phonetic: "mi" },
      { text: "نِ", phonetic: "ni" },
      { text: "وِ", phonetic: "wi" },
      { text: "هِ", phonetic: "hi" },
      { text: "لاِ", phonetic: "li" },
      { text: "ءِ", phonetic: "i" },
      { text: "يِ", phonetic: "yi" }
    ]
  },
  {
    id: 4,
    title: "Lesson 4: Damma",
    subtitle: "حَرَكَة الضَّمَّة",
    desc: "Letters with the Damma (short 'u') mark.",
    words: [
      { text: "اُ", phonetic: "u" },
      { text: "بُ", phonetic: "bu" },
      { text: "تُ", phonetic: "tu" },
      { text: "ثُ", phonetic: "thu" },
      { text: "جُ", phonetic: "ju" },
      { text: "حُ", phonetic: "hu" },
      { text: "خُ", phonetic: "khu" },
      { text: "دُ", phonetic: "du" },
      { text: "ذُ", phonetic: "dhu" },
      { text: "رُ", phonetic: "ru" },
      { text: "زُ", phonetic: "zu" },
      { text: "سُ", phonetic: "su" },
      { text: "شُ", phonetic: "shu" },
      { text: "صُ", phonetic: "su" },
      { text: "ضُ", phonetic: "du" },
      { text: "طُ", phonetic: "tu" },
      { text: "ظُ", phonetic: "zu" },
      { text: "عُ", phonetic: "u" },
      { text: "غُ", phonetic: "ghu" },
      { text: "فُ", phonetic: "fu" },
      { text: "قُ", phonetic: "qu" },
      { text: "كُ", phonetic: "ku" },
      { text: "لُ", phonetic: "lu" },
      { text: "مُ", phonetic: "mu" },
      { text: "نُ", phonetic: "nu" },
      { text: "وُ", phonetic: "wu" },
      { text: "هُ", phonetic: "hu" },
      { text: "لاُ", phonetic: "lu" },
      { text: "ءُ", phonetic: "u" },
      { text: "يُ", phonetic: "yu" }
    ]
  },
  {
    id: 5,
    title: "Lesson 5: Joining 1",
    subtitle: "تَدْرِيبَات",
    desc: "Practice reading joined words with vowels.",
    words: [
      { text: "أَغْوَا", phonetic: "aghwa" },
      { text: "أَفْوَا", phonetic: "afwa" },
      { text: "أَقْوَا", phonetic: "aqwa" },
      { text: "أَكْوَا", phonetic: "akwa" },
      { text: "أَلْوَا", phonetic: "alwa" },
      { text: "أَمْوَا", phonetic: "amwa" },
      { text: "أَنْوَا", phonetic: "anwa" },
      { text: "أَوْوَا", phonetic: "awwa" },
      { text: "أَهْوَا", phonetic: "ahwa" },
      { text: "لَاء", phonetic: "laa" },
      { text: "أَيَّوَا", phonetic: "ayyawa" },
    ]
  },
  {
    id: 6,
    title: "Lesson 6: Joining 2",
    subtitle: "تَدْرِيبَات",
    desc: "More joined words.",
    words: [
      { text: "أَبِي", phonetic: "abi" },
      { text: "أَتِي", phonetic: "ati" },
      { text: "أَثِي", phonetic: "athi" },
      { text: "أَجِي", phonetic: "aji" },
      { text: "أَحِي", phonetic: "ahi" },
      { text: "أَخِي", phonetic: "akhi" },
      { text: "أَدِي", phonetic: "adi" },
      { text: "أَذِي", phonetic: "adhi" },
      { text: "أَرِي", phonetic: "ari" },
      { text: "أَزِي", phonetic: "azi" },
      { text: "أَسِي", phonetic: "asi" },
      { text: "أَشِي", phonetic: "ashi" },
      { text: "أَصِي", phonetic: "asi" },
      { text: "أَضِي", phonetic: "adi" },
      { text: "أَطِي", phonetic: "ati" },
      { text: "أَظِي", phonetic: "athi" },
      { text: "أَعِي", phonetic: "a'i" },
      { text: "أَغِي", phonetic: "aghi" },
      { text: "أَفِي", phonetic: "afi" },
      { text: "أَقِي", phonetic: "aqi" },
      { text: "أَكِي", phonetic: "aki" },
      { text: "أَلِي", phonetic: "ali" },
      { text: "أَمِي", phonetic: "ami" },
      { text: "أَنِي", phonetic: "ani" },
      { text: "أَوِي", phonetic: "awi" },
      { text: "هَوِي", phonetic: "hawi" },
      { text: "يَوِي", phonetic: "yawi" }
    ]
  },
  {
    id: 7,
    title: "Lesson 7: Practice",
    subtitle: "تَدْرِيبَات",
    desc: "Longer words and agreements.",
    words: [
      { text: "خَائِفُونَ", phonetic: "khaa-ifoon" },
      { text: "قَائِمُونَ", phonetic: "qaa-imoon" },
      { text: "غَافِلُونَ", phonetic: "ghaa-filoon" },
      { text: "حَاضِرُونَ", phonetic: "haa-diroon" },
      { text: "تَائِبُونَ", phonetic: "taa-iboon" },
      { text: "تَعْلَمُونَ", phonetic: "ta'lamoon" },
      { text: "يَعْقِلُونَ", phonetic: "ya'qiloon" },
      { text: "مَالِكُونَ", phonetic: "maa-likoon" },
      { text: "هَاشِمُونَ", phonetic: "haa-shimoon" },
      { text: "وَاسِعُونَ", phonetic: "waa-si'oon" },
      { text: "تَكْلِمُونَ", phonetic: "tak-limoon" },
      { text: "بَيْنَهُم", phonetic: "bay-nahum" }
    ]
  },
  {
    id: 8,
    title: "Lesson 8: Phrases",
    subtitle: "تَدْرِيبَات",
    desc: "Short sentences and phrases.",
    words: [
      { text: "ذَاكِرُونَ", phonetic: "dhaa-kiroon" },
      { text: "رَاشِدُونَ", phonetic: "raa-shidoon" },
      { text: "رَاهِبِينَ", phonetic: "raa-hibeen" },
      { text: "الْعَالَمِينَ", phonetic: "al-aalameen" },
      { text: "إنَّ اللَّهَ", phonetic: "innallaha" },
      { text: "غَفُورٌ رَّحِيمٌ", phonetic: "ghafoorun-raheem" }
    ]
  },
  {
    id: 9,
    title: "Lesson 9: More Words",
    subtitle: "تَدْرِيبَات",
    desc: "Additional spelling practice.",
    words: [
      { text: "قَلِيلٌ", phonetic: "qaleelun" },
      { text: "جَلِيلٌ", phonetic: "jaleelun" },
      { text: "عَلِيلٌ", phonetic: "aleelun" },
      { text: "رَفِيقٌ", phonetic: "rafeequn" },
      { text: "رَحِيقٌ", phonetic: "raheequn" },
      { text: "شَهِيقٌ", phonetic: "shaheequn" },
      { text: "عَمِيقٌ", phonetic: "ameequn" },
      { text: "مُعِينٌ", phonetic: "mu'eenun" },
      { text: "مَتِينٌ", phonetic: "mateenun" },
      { text: "أَمِينٌ", phonetic: "ameenun" },
      { text: "بَعِيدٌ", phonetic: "ba'eedun" },
      { text: "رَشِيدٌ", phonetic: "rasheedun" }
    ]
  }
];

export default function ArabicLearning() {
  const [activeLessonId, setActiveLessonId] = useState(1);
  const [activeWord, setActiveWord] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const saved = localStorage.getItem("deeni_qaida_progress");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const currentLesson = QAIDA_LESSONS.find(l => l.id === activeLessonId);

  const selectWord = (wordObj) => {
    setActiveWord(wordObj);
    speak(wordObj.text);
  };

  const completeLesson = () => {
    // Mark as complete
    if (!completedLessons.includes(activeLessonId)) {
      const nextProgress = [...completedLessons, activeLessonId];
      setCompletedLessons(nextProgress);
      try {
        localStorage.setItem("deeni_qaida_progress", JSON.stringify(nextProgress));
      } catch {
        // ignore
      }
    }

    // Go to next lesson
    if (activeLessonId < QAIDA_LESSONS.length) {
      setActiveLessonId(activeLessonId + 1);
      setActiveWord(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="p-5 max-w-3xl mx-auto pt-6 pb-24">
      <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-emerald-600 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Home
      </Link>

      <h2 className="text-2xl font-extrabold text-emerald-800 mb-1">
        Learn to Read the Quran
      </h2>
      <p className="text-gray-500 text-sm mb-5">
        Follow the lessons exactly as they appear in the book. Finish each page by reading all words and tapping Walsalam.
      </p>

      {/* Lesson Selector Row */}
      <div className="flex overflow-x-auto gap-2 pb-3 mb-4 scrollbar-hide">
        {QAIDA_LESSONS.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => { setActiveLessonId(lesson.id); setActiveWord(null); }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all ${activeLessonId === lesson.id
                ? "bg-emerald-600 text-white shadow-sm"
                : completedLessons.includes(lesson.id)
                  ? "bg-emerald-100/50 text-emerald-700 border-emerald-200 border"
                  : "bg-white text-gray-500 border border-gray-200"
              }`}
          >
            {completedLessons.includes(lesson.id) ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
                {lesson.id}
              </span>
            )}
            Lesson {lesson.id}
          </button>
        ))}
      </div>

      {/* Lesson Header */}
      <div className="mb-5 bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📖</span>
            <h3 className="text-lg font-bold text-emerald-800">{currentLesson.title}</h3>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{currentLesson.desc}</p>
        </div>
        <div className="text-2xl font-arabic text-emerald-500 hidden sm:block">
          {currentLesson.subtitle}
        </div>
      </div>

      {/* Practice Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 bg-white p-4 sm:p-5 rounded-t-2xl shadow-sm border border-emerald-100 border-b-0" dir="rtl">
        {currentLesson.words.map((item, idx) => (
          <button
            key={idx}
            onClick={() => selectWord(item)}
            className={`bg-emerald-50/40 rounded-xl border p-3 flex flex-col items-center justify-center gap-1 transition-all active:scale-90 ${activeWord && activeWord.text === item.text
                ? "border-emerald-500 ring-2 ring-emerald-200 bg-emerald-100"
                : "border-emerald-100 hover:bg-emerald-100/60"
              }`}
          >
            <div className="text-3xl font-arabic text-emerald-800 leading-none">
              {item.text}
            </div>
            <div className="text-[9px] text-gray-400 italic font-sans mt-1" dir="ltr">
              {item.phonetic}
            </div>
          </button>
        ))}
      </div>

      {/* Walsalam Button Bottom Bar */}
      <button
        onClick={completeLesson}
        className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-b-2xl p-6 shadow-sm active:scale-[0.99] transition-transform group flex flex-col items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="border border-emerald-400/30 px-8 py-3 rounded bg-emerald-900/20 backdrop-blur-sm">
          <span className="text-4xl sm:text-5xl font-arabic font-extrabold tracking-widest drop-shadow-sm text-emerald-50">وَالسَّلَام</span>
        </div>
        <span className="text-emerald-100/70 text-[11px] font-bold uppercase mt-3 tracking-widest group-hover:text-white transition-colors">
          Tap when finished with this page
        </span>
      </button>

      {/* Active Pronunciation Card */}
      {activeWord && (
        <div className="mt-6 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-3xl p-6 text-center animate-fade-up shadow-lg">
          <div className="text-7xl font-arabic mb-4 leading-none pt-2">
            {activeWord.text}
          </div>
          <div className="text-xl font-bold font-sans tracking-wide text-emerald-50">{activeWord.phonetic}</div>
          <button
            onClick={() => speak(activeWord.text)}
            className="mt-6 inline-flex items-center justify-center w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full transition-colors active:scale-90"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
