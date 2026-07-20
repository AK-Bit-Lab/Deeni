import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, CheckCircle2, XCircle, Loader2, Award } from "lucide-react";
import { useQuiz, useQuizHistory } from "../hooks/useQuiz";
import { QUIZ_TOPICS } from "../constants";
import { formatTxError } from "../utils/formatTxError";

/* ------------------------------------------------------------------ */
/* Question bank — keyed by topic id (matches DeeniQuiz.sol 0-9).      */
/* Each question: { q, options[], answer (index) }                     */
/* ------------------------------------------------------------------ */
const QUESTION_BANK = {
  // 0 — Quran
  0: [
    { q: "How many surahs are in the Quran?", options: ["100", "114", "120", "99"], answer: 1 },
    { q: "Which is the longest surah in the Quran?", options: ["Surah Al-Baqarah", "Surah Al-Imran", "Surah An-Nisa", "Surah Al-Ma'idah"], answer: 0 },
    { q: "Which surah is known as 'The Heart of the Quran'?", options: ["Al-Fatihah", "Yasin", "Ar-Rahman", "Al-Mulk"], answer: 1 },
    { q: "How many verses are in Surah Al-Fatihah?", options: ["5", "6", "7", "8"], answer: 2 },
    { q: "In which surah is Bismillah mentioned as a complete verse?", options: ["Al-Fatihah", "An-Naml", "Both", "Neither"], answer: 2 },
    { q: "The Quran was revealed over how many years?", options: ["10", "23", "40", "50"], answer: 1 },
    { q: "Which surah is called 'The Mother of the Book'?", options: ["Al-Baqarah", "Al-Fatihah", "Al-Ikhlas", "Yasin"], answer: 1 },
    { q: "What is the first word revealed of the Quran?", options: ["Bismillah", "Iqra", "Qul", "Alhamdulillah"], answer: 1 },
  ],
  // 1 — Tajweed
  1: [
    { q: "What does 'Tajweed' mean?", options: ["To recite fast", "To make beautiful / proficient", "To memorize", "To translate"], answer: 1 },
    { q: "Which is a rule of Tajweed?", options: ["Qalqalah", "Salah", "Zakat", "Sawm"], answer: 0 },
    { q: "Qalqalah is an echo sound on which letters?", options: ["ق ط ب ج د", "ا و ي", "م ن", "ر ل"], answer: 0 },
    { q: "Ghunnah (nasal sound) is associated with which letters?", options: ["م ن", "ق ط", "ب ج", "د ذ"], answer: 0 },
    { q: "Idgham means what in Tajweed?", options: ["Hiding", "Merging / joining", "Echo", "Lengthening"], answer: 1 },
    { q: "Madd refers to what?", options: ["Shortening", "Lengthening / prolongation", "Stopping", "Echo"], answer: 1 },
    { q: "Ikhfa means what?", options: ["Hiding / concealment", "Merging", "Echo", "Stopping"], answer: 0 },
    { q: "How many harakat (vowel marks) are there in Arabic?", options: ["3", "5", "7", "9"], answer: 3 },
  ],
  // 2 — Arabic Letters
  2: [
    { q: "How many letters are in the Arabic alphabet?", options: ["26", "28", "30", "32"], answer: 1 },
    { q: "Which letter is 'Alif'?", options: ["ا", "ب", "ت", "ث"], answer: 0 },
    { q: "Fatha is which vowel sound?", options: ["a", "i", "u", "none"], answer: 0 },
    { q: "Which letter is pronounced with lips touching (ب)?", options: ["Ba", "Ta", "Tha", "Jeem"], answer: 0 },
    { q: "Which are non-connecting letters (only join from the right)?", options: ["ا د ذ ر ز و", "ب ت ث ج", "س ش ص ض", "ك ل م ن"], answer: 0 },
    { q: "Sukun indicates what?", options: ["A vowel", "No vowel / still", "Doubling", "Lengthening"], answer: 1 },
    { q: "Shadda indicates what?", options: ["A long vowel", "Doubling a consonant", "No vowel", "A nasal sound"], answer: 1 },
    { q: "Which letter is 'Noon'?", options: ["ن", "م", "ب", "ت"], answer: 0 },
  ],
  // 3 — Pillars of Islam
  3: [
    { q: "How many pillars of Islam are there?", options: ["3", "4", "5", "6"], answer: 2 },
    { q: "What is the first pillar of Islam?", options: ["Salah", "Shahadah", "Zakat", "Hajj"], answer: 1 },
    { q: "How many obligatory prayers are there daily?", options: ["3", "5", "7", "9"], answer: 1 },
    { q: "Zakat is what percentage of qualifying wealth?", options: ["1%", "2.5%", "5%", "10%"], answer: 1 },
    { q: "Which pillar is performed once in a lifetime (if able)?", options: ["Salah", "Sawm", "Hajj", "Zakat"], answer: 2 },
    { q: "Sawm (fasting) is obligatory in which month?", options: ["Rajab", "Ramadan", "Shaban", "Muharram"], answer: 1 },
    { q: "The Shahadah declares belief in what?", options: ["One God and Muhammad as His messenger", "Five prayers", "Charity", "Fasting"], answer: 0 },
    { q: "Which prayer has the most rakats?", options: ["Fajr", "Dhuhr", "Maghrib", "Isha"], answer: 3 },
  ],
  // 4 — Pillars of Iman
  4: [
    { q: "How many pillars of Iman (faith) are there?", options: ["5", "6", "7", "8"], answer: 1 },
    { q: "Belief in which is NOT a pillar of Iman?", options: ["Allah", "Angels", "Books", "Money"], answer: 3 },
    { q: "Belief in the messengers is which pillar?", options: ["1st", "2nd", "4th", "5th"], answer: 2 },
    { q: "How many holy books are mentioned in the Quran?", options: ["2", "3", "4", "5"], answer: 2 },
    { q: "Belief in the Day of Judgment is a pillar of what?", options: ["Islam", "Iman", "Ihsan", "Tawheed"], answer: 1 },
    { q: "Qadar refers to belief in what?", options: ["Angels", "Divine decree / predestination", "Books", "Prophets"], answer: 1 },
    { q: "Which is a pillar of Iman?", options: ["Salah", "Belief in Allah's books", "Zakat", "Hajj"], answer: 1 },
    { q: "Angels are created from what?", options: ["Clay", "Light", "Fire", "Water"], answer: 1 },
  ],
  // 5 — Prophets
  5: [
    { q: "Who is the final prophet in Islam?", options: ["Musa", "Isa", "Muhammad ﷺ", "Ibrahim"], answer: 2 },
    { q: "Which prophet built the Kaaba with his son?", options: ["Musa", "Ibrahim", "Nuh", "Dawud"], answer: 1 },
    { q: "Which prophet is associated with the Ark / great flood?", options: ["Nuh", "Hud", "Salih", "Lut"], answer: 0 },
    { q: "To which prophet was the Torah revealed?", options: ["Isa", "Musa", "Dawud", "Muhammad ﷺ"], answer: 1 },
    { q: "To which prophet was the Injil (Gospel) revealed?", options: ["Musa", "Isa", "Dawud", "Sulaiman"], answer: 1 },
    { q: "Which prophet is known as 'Khalilullah' (Friend of Allah)?", options: ["Ibrahim", "Musa", "Nuh", "Adam"], answer: 0 },
    { q: "How many prophets are mentioned by name in the Quran?", options: ["15", "25", "40", "124000"], answer: 1 },
    { q: "Which prophet could speak to animals and ruled a kingdom?", options: ["Dawud", "Sulaiman", "Yusuf", "Yunus"], answer: 1 },
  ],
  // 6 — Seerah
  6: [
    { q: "In which year was Prophet Muhammad ﷺ born?", options: ["570 CE", "610 CE", "622 CE", "632 CE"], answer: 0 },
    { q: "In which cave did the Prophet ﷺ receive the first revelation?", options: ["Cave Hira", "Cave Thawr", "Cave Uhud", "Cave Badr"], answer: 0 },
    { q: "The Hijrah (migration to Madinah) was in which year?", options: ["610 CE", "622 CE", "630 CE", "632 CE"], answer: 1 },
    { q: "How old was the Prophet ﷺ when he received prophethood?", options: ["25", "30", "40", "50"], answer: 2 },
    { q: "The first revelation was which surah (verses)?", options: ["Al-Fatihah", "Al-Alaq (1-5)", "Al-Muddaththir", "Al-Muzzammil"], answer: 1 },
    { q: "Which battle was the first major battle in Islamic history?", options: ["Badr", "Uhud", "Khandaq", "Hunayn"], answer: 0 },
    { q: "The Prophet ﷺ passed away in which year?", options: ["622 CE", "630 CE", "632 CE", "640 CE"], answer: 2 },
    { q: "Who was the first caliph after the Prophet ﷺ?", options: ["Umar", "Abu Bakr", "Uthman", "Ali"], answer: 1 },
  ],
  // 7 — Fiqh / Salah
  7: [
    { q: "How many rakats are in Fajr prayer?", options: ["2", "3", "4", "5"], answer: 0 },
    { q: "Which direction do Muslims face during prayer?", options: ["North", "Qibla (Kaaba)", "East", "West"], answer: 1 },
    { q: "What is wudu?", options: ["A prayer", "Ablution / washing", "A charity", "A fast"], answer: 1 },
    { q: "How many times is the adhan (call to prayer) called daily?", options: ["3", "5", "7", "9"], answer: 1 },
    { q: "Which prayer is performed in the late afternoon?", options: ["Fajr", "Dhuhr", "Asr", "Isha"], answer: 2 },
    { q: "What is said at the end of prayer to greet angels?", options: ["Takbir", "Salam", "Dua", "Tasbih"], answer: 1 },
    { q: "How many obligatory (fard) rakats in Dhuhr?", options: ["2", "3", "4", "6"], answer: 2 },
    { q: "Jumu'ah prayer replaces which prayer on Friday?", options: ["Fajr", "Dhuhr", "Asr", "Maghrib"], answer: 1 },
  ],
  // 8 — Hadith
  8: [
    { q: "What is a hadith?", options: ["A verse of the Quran", "A saying/action of the Prophet ﷺ", "A prayer", "A charity"], answer: 1 },
    { q: "Which collection is considered the most authentic after the Quran?", options: ["Sahih al-Bukhari", "Sunan Abu Dawud", "Muwatta Malik", "Musnad Ahmad"], answer: 0 },
    { q: "How many major hadith collections are in the 'Kutub al-Sittah'?", options: ["4", "5", "6", "7"], answer: 2 },
    { q: "What does 'isnad' refer to in hadith?", options: ["The text", "The chain of narrators", "The topic", "The book"], answer: 1 },
    { q: "What does 'matn' refer to in hadith?", options: ["The chain", "The text / content", "The narrator", "The compiler"], answer: 1 },
    { q: "Which is NOT one of the Kutub al-Sittah?", options: ["Bukhari", "Muslim", "Muwatta Malik", "Abu Dawud"], answer: 2 },
    { q: "Sahih Muslim was compiled by whom?", options: ["Imam Muslim", "Imam Bukhari", "Imam Ahmad", "Imam Malik"], answer: 0 },
    { q: "A 'sahih' hadith means it is what?", options: ["Weak", "Authentic", "Fabricated", "Abrogated"], answer: 1 },
  ],
  // 9 — General Knowledge
  9: [
    { q: "What does 'Islam' mean?", options: ["Peace / submission", "Prayer", "Charity", "Knowledge"], answer: 0 },
    { q: "What is the Islamic greeting?", options: ["Hello", "Assalamu alaikum", "Shalom", "Namaste"], answer: 1 },
    { q: "What does 'Bismillah' mean?", options: ["Praise be to Allah", "In the name of Allah", "Allah is great", "There is no god but Allah"], answer: 1 },
    { q: "What is the meaning of 'Insha'Allah'?", options: ["Thank God", "If Allah wills", "God is great", "God willing forgive me"], answer: 1 },
    { q: "What is 'Jannah'?", options: ["Hell", "Paradise", "This world", "The grave"], answer: 1 },
    { q: "What is the meaning of 'Subhanallah'?", options: ["Glory be to Allah", "God is great", "Praise be to Allah", "There is no god but Allah"], answer: 0 },
    { q: "What does 'Eid' mean?", options: ["Prayer", "Festival / celebration", "Fast", "Charity"], answer: 1 },
    { q: "What is the holy day of the week for Muslims?", options: ["Saturday", "Sunday", "Friday", "Monday"], answer: 2 },
  ],
};

const QUESTIONS_PER_QUIZ = 5;

// Simple string hash → bytes32 (deterministic, tamper-evident).
function hashQuestions(questions) {
  const str = questions.map((q) => `${q.q}|${q.answer}`).join("||");
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul((h2 + c) ^ (h2 >>> 13), 0x85ebca6b) >>> 0;
  }
  const hex =
    h1.toString(16).padStart(8, "0") +
    h2.toString(16).padStart(8, "0") +
    "00000000000000000000000000000000";
  return "0x" + hex.slice(0, 64);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function KnowledgeTest() {
  const { stats, totalQuizzes, submitQuiz, isPending, isConfirming, isConfirmed, error } = useQuiz();
  const { history } = useQuizHistory(0, 10);

  const [stage, setStage] = useState("topics"); // topics | quiz | result
  const [topicId, setTopicId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]); // selected index per question
  const [submitted, setSubmitted] = useState(false);

  const topic = QUIZ_TOPICS.find((t) => t.id === topicId);

  const startQuiz = (id) => {
    const pool = QUESTION_BANK[id] || [];
    const picked = shuffle(pool).slice(0, Math.min(QUESTIONS_PER_QUIZ, pool.length));
    setTopicId(id);
    setQuestions(picked);
    setAnswers(new Array(picked.length).fill(-1));
    setCurrent(0);
    setSubmitted(false);
    setStage("quiz");
  };

  const score = useMemo(
    () => answers.reduce((acc, a, i) => acc + (a === questions[i]?.answer ? 1 : 0), 0),
    [answers, questions]
  );

  const selectOption = (idx) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = idx;
      return next;
    });
  };

  const next = () => setCurrent((c) => Math.min(c + 1, questions.length - 1));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const finish = () => {
    setStage("result");
    setSubmitted(false);
  };

  const submitOnChain = () => {
    const qHash = hashQuestions(questions);
    submitQuiz(topicId, score, questions.length, qHash);
    setSubmitted(true);
  };

  /* ---------- Topics view ---------- */
  if (stage === "topics") {
    return (
      <div className="p-5 pt-8 max-w-md mx-auto">
        <Link to="/" className="flex items-center gap-2 text-gray-500 mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-deeni-dark leading-none">Knowledge Test</h1>
            <p className="text-gray-500 text-xs">Test your deen · recorded on-chain</p>
          </div>
        </div>

        {/* Stats summary */}
        <div className="bg-white rounded-2xl p-4 mb-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-gray-700">Your record</span>
          </div>
          <div className="text-3xl font-extrabold text-deeni-dark">{totalQuizzes}</div>
          <div className="text-xs text-gray-400">quizzes recorded on-chain</div>
        </div>

        <h2 className="text-sm font-semibold text-gray-600 mb-3">Choose a topic</h2>
        <div className="grid grid-cols-2 gap-3">
          {QUIZ_TOPICS.map((t) => {
            const s = stats[t.id];
            return (
              <button
                key={t.id}
                onClick={() => startQuiz(t.id)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left active:scale-95 transition-transform flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{t.icon}</span>
                  {s.attempts > 0 && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {s.pct}%
                    </span>
                  )}
                </div>
                <div className="font-bold text-sm text-gray-800 leading-tight">{t.label}</div>
                <div className="text-[10px] text-gray-400">
                  {s.attempts > 0 ? `${s.attempts} attempt${s.attempts > 1 ? "s" : ""} · best ${s.bestScore}/${s.bestTotal}` : "No attempts yet"}
                </div>
              </button>
            );
          })}
        </div>

        {/* Recent history */}
        {history.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-600 mb-3">Recent results (on-chain)</h2>
            <div className="space-y-2">
              {history.map((h, i) => {
                const t = QUIZ_TOPICS[h.topic];
                const pct = h.total > 0 ? Math.round((h.score / h.total) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                    <span className="text-xl">{t?.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-800">{t?.label}</div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(h.timestamp * 1000).toLocaleDateString()} · {h.score}/{h.total}
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${pct >= 70 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-rose-500"}`}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------- Quiz view ---------- */
  if (stage === "quiz") {
    const q = questions[current];
    const answered = answers[current] !== -1;
    const allAnswered = answers.every((a) => a !== -1);
    return (
      <div className="p-5 pt-8 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setStage("topics")} className="flex items-center gap-2 text-gray-500 text-sm">
            <ArrowLeft className="w-4 h-4" /> Exit
          </button>
          <span className="text-xs font-semibold text-gray-500">
            {topic?.icon} {topic?.label} · {current + 1}/{questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <p className="text-lg font-bold text-gray-800 mb-4">{q.q}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const selected = answers[current] === i;
              return (
                <button
                  key={i}
                  onClick={() => selectOption(i)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    selected
                      ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                      : "border-gray-200 bg-white text-gray-700 active:scale-[0.98]"
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    selected ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm font-medium">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={prev}
            disabled={current === 0}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm disabled:opacity-40"
          >
            Previous
          </button>
          {current < questions.length - 1 ? (
            <button
              onClick={next}
              disabled={!answered}
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm disabled:opacity-40 active:scale-95"
            >
              Next
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={!allAnswered}
              className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm disabled:opacity-40 active:scale-95"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ---------- Result view ---------- */
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const passed = pct >= 70;
  return (
    <div className="p-5 pt-8 max-w-md mx-auto">
      <div className="flex flex-col items-center text-center mb-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 ${
          passed ? "bg-emerald-100" : "bg-amber-100"
        }`}>
          {passed ? <CheckCircle2 className="w-10 h-10 text-emerald-600" /> : <Award className="w-10 h-10 text-amber-600" />}
        </div>
        <h1 className="text-2xl font-extrabold text-deeni-dark">
          {passed ? "Mashallah! 🎉" : "Keep learning 📚"}
        </h1>
        <p className="text-gray-500 text-sm">
          {topic?.icon} {topic?.label} · You scored
        </p>
        <div className="text-5xl font-extrabold text-deeni-dark mt-1">
          {score}<span className="text-2xl text-gray-400">/{questions.length}</span>
        </div>
        <div className={`text-lg font-bold ${passed ? "text-emerald-600" : "text-amber-600"}`}>{pct}%</div>
      </div>

      {/* Review */}
      <div className="space-y-2 mb-6">
        {questions.map((q, i) => {
          const correct = answers[i] === q.answer;
          return (
            <div key={i} className="bg-white rounded-xl p-3 border border-gray-100">
              <div className="flex items-start gap-2">
                {correct ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{q.q}</p>
                  {!correct && (
                    <p className="text-xs text-emerald-600 mt-1">
                      Correct: {q.options[q.answer]}
                    </p>
                  )}
                  {!correct && answers[i] !== -1 && (
                    <p className="text-xs text-rose-500">
                      Your answer: {q.options[answers[i]]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* On-chain submission */}
      <div className="bg-gradient-to-br from-indigo-50 to-emerald-50 rounded-2xl p-4 mb-4 border border-indigo-100">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-bold text-gray-800">Record on-chain</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Commit this result to the Celo blockchain. Your score becomes permanent and verifiable. You pay a small gas fee.
        </p>

        {submitted && isConfirming && (
          <div className="flex items-center gap-2 text-sm text-indigo-600 mb-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Confirming on-chain…
          </div>
        )}
        {submitted && isConfirmed && (
          <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-emerald-600 mb-2 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Recorded on-chain! ✓
          </div>
        )}
        {error && (
          <p className="text-xs text-rose-500 mb-2">{formatTxError(error)}</p>
        )}

        <button
          onClick={submitOnChain}
          disabled={isPending || isConfirming || (submitted && isConfirmed)}
          className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {submitted && isConfirmed ? "Already recorded" : isPending ? "Sign in wallet…" : "Record on Celo"}
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => startQuiz(topicId)}
          className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm active:scale-95"
        >
          Retry
        </button>
        <button
          onClick={() => setStage("topics")}
          className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm active:scale-95"
        >
          Other topics
        </button>
      </div>
    </div>
  );
}
