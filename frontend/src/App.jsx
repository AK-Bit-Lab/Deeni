import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  Home,
  Compass,
  BookOpen,
  Calculator,
  Calendar as CalendarIcon,
  Sparkles,
  Flame,
  Trophy,
  Sun,
  Moon,
} from "lucide-react";
import ArabicLearning from "./components/ArabicLearning";
import QiblaFinder from "./components/QiblaFinder";
import ZakatCalculator from "./components/ZakatCalculator";
import HijriCalendar from "./components/HijriCalendar";
import NamesOfAllah from "./components/NamesOfAllah";
import DailyDeeds from "./components/DailyDeeds";
import KnowledgeTest from "./components/KnowledgeTest";
import TasbihCounter from "./components/TasbihCounter";
import SubscriptionGuard from "./components/SubscriptionGuard";
import { useTheme } from "./hooks/useTheme";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 active:scale-90 transition-transform"
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

function MainMenu() {
  const cards = [
    {
      title: "Daily Deeds",
      desc: "Record worship on-chain",
      icon: <Flame className="w-7 h-7" />,
      path: "/deeds",
      color: "from-orange-500 to-orange-700",
    },
    {
      title: "Read Quran",
      desc: "Letters · Tajweed · Words",
      icon: <BookOpen className="w-7 h-7" />,
      path: "/learn",
      color: "from-blue-500 to-blue-700",
    },
    {
      title: "Qibla Direction",
      desc: "Live compass to Mecca",
      icon: <Compass className="w-7 h-7" />,
      path: "/qibla",
      color: "from-emerald-500 to-emerald-700",
    },
    {
      title: "Zakat Calculator",
      desc: "Calculate your 2.5%",
      icon: <Calculator className="w-7 h-7" />,
      path: "/zakat",
      color: "from-amber-500 to-amber-700",
    },
    {
      title: "Hijri Calendar",
      desc: "Islamic date today",
      icon: <CalendarIcon className="w-7 h-7" />,
      path: "/calendar",
      color: "from-purple-500 to-purple-700",
    },
    {
      title: "99 Names of Allah",
      desc: "Asma ul Husna",
      icon: <Sparkles className="w-7 h-7" />,
      path: "/names",
      color: "from-rose-500 to-rose-700",
    },
    {
      title: "Knowledge Test",
      desc: "Quiz · recorded on-chain",
      icon: <Trophy className="w-7 h-7" />,
      path: "/quiz",
      color: "from-indigo-500 to-indigo-700",
    },
    {
      title: "Tasbih Counter",
      desc: "Tap to count your dhikr",
      icon: <span className="text-2xl leading-none">📿</span>,
      path: "/tasbih",
      color: "from-teal-500 to-teal-700",
    },
  ];

  return (
    <div className="p-5 pt-8">
      {/* Hero header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-lg shrink-0">
          <span className="text-2xl">☪️</span>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-deeni-dark dark:text-emerald-400 leading-none">
            Deeni
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Your path of light · ديني</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Bismillah banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-2xl p-5 mb-6 shadow-md">
        <p lang="ar" dir="rtl" className="font-quran text-2xl text-center mb-1">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <p className="text-emerald-100 text-xs text-center">
          In the name of Allah, the Most Compassionate, the Most Merciful
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <Link
            key={i}
            to={card.path}
            aria-label={`${card.title} - ${card.desc}`}
            className={`bg-gradient-to-br ${card.color} text-white p-5 rounded-2xl shadow-md flex flex-col gap-3 active:scale-95 transition-transform min-h-[120px] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-50 dark:focus:ring-offset-gray-950`}
          >
            {card.icon}
            <div>
              <div className="font-bold text-sm leading-tight">{card.title}</div>
              <div className="text-white/70 text-xs mt-0.5">{card.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* On-chain badge */}
      <div className="mt-6 text-center">
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Fully on-chain · Built on Celo MiniPay
        </span>
      </div>
    </div>
  );
}

function BottomNav() {
  const loc = useLocation();
  const navs = [
    { name: "Home", path: "/", icon: <Home className="w-6 h-6" /> },
    { name: "Qibla", path: "/qibla", icon: <Compass className="w-6 h-6" /> },
    { name: "Learn", path: "/learn", icon: <BookOpen className="w-6 h-6" /> },
    { name: "Zakat", path: "/zakat", icon: <Calculator className="w-6 h-6" /> },
  ];

  return (
    <div className="fixed bottom-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-700 flex justify-around p-2.5 pb-safe z-50">
      {navs.map((n, i) => (
        <Link
          key={i}
          to={n.path}
          aria-label={n.name}
          aria-current={loc.pathname === n.path ? "page" : undefined}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            loc.pathname === n.path ? "text-deeni-dark dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {n.icon}
          <span className="text-[10px] font-medium">{n.name}</span>
        </Link>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-emerald-50 dark:bg-gray-950 font-sans relative pb-20 transition-colors duration-300">
      <SubscriptionGuard>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/learn" element={<ArabicLearning />} />
          <Route path="/qibla" element={<QiblaFinder />} />
          <Route path="/zakat" element={<ZakatCalculator />} />
          <Route path="/calendar" element={<HijriCalendar />} />
          <Route path="/names" element={<NamesOfAllah />} />
          <Route path="/deeds" element={<DailyDeeds />} />
          <Route path="/quiz" element={<KnowledgeTest />} />
          <Route path="/tasbih" element={<TasbihCounter />} />
        </Routes>
      </SubscriptionGuard>
      <BottomNav />
    </div>
  );
}
