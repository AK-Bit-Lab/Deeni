import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Volume2, Search } from "lucide-react";
import { speak } from "../utils/speak";

// The 99 Names of Allah (Asma ul Husna).
const NAMES = [
  { arabic: "الرَّحْمَٰنُ", translit: "Ar-Rahman", meaning: "The Most Compassionate" },
  { arabic: "الرَّحِيمُ", translit: "Ar-Raheem", meaning: "The Most Merciful" },
  { arabic: "الْمَلِكُ", translit: "Al-Malik", meaning: "The King and Owner of Dominion" },
  { arabic: "الْقُدُّوسُ", translit: "Al-Quddus", meaning: "The Absolutely Pure" },
  { arabic: "السَّلَامُ", translit: "As-Salam", meaning: "The Source of Peace" },
  { arabic: "الْمُؤْمِنُ", translit: "Al-Mu'min", meaning: "The Guardian of Faith" },
  { arabic: "الْمُهَيْمِنُ", translit: "Al-Muhaymin", meaning: "The Overseer of All" },
  { arabic: "الْعَزِيزُ", translit: "Al-Azeez", meaning: "The All-Mighty" },
  { arabic: "الْجَبَّارُ", translit: "Al-Jabbar", meaning: "The Compeller" },
  { arabic: "الْمُتَكَبِّرُ", translit: "Al-Mutakabbir", meaning: "The Supreme" },
  { arabic: "الْخَالِقُ", translit: "Al-Khaliq", meaning: "The Creator" },
  { arabic: "الْبَارِئُ", translit: "Al-Bari'", meaning: "The Originator" },
  { arabic: "الْمُصَوِّرُ", translit: "Al-Musawwir", meaning: "The Fashioner of Forms" },
  { arabic: "الْغَفَّارُ", translit: "Al-Ghaffar", meaning: "The Constant Forgiver" },
  { arabic: "الْقَهَّارُ", translit: "Al-Qahhar", meaning: "The Subduer" },
  { arabic: "الْوَهَّابُ", translit: "Al-Wahhab", meaning: "The Bestower" },
  { arabic: "الرَّزَّاقُ", translit: "Ar-Razzaq", meaning: "The Provider" },
  { arabic: "الْفَتَّاحُ", translit: "Al-Fattah", meaning: "The Supreme Opener" },
  { arabic: "الْعَلِيمُ", translit: "Al-'Aleem", meaning: "The All-Knowing" },
  { arabic: "الْقَابِضُ", translit: "Al-Qabid", meaning: "The Withholder" },
  { arabic: "الْبَاسِطُ", translit: "Al-Basit", meaning: "The Reliever" },
  { arabic: "الْخَافِضُ", translit: "Al-Khafid", meaning: "The Abaser" },
  { arabic: "الرَّافِعُ", translit: "Ar-Rafi'", meaning: "The Exalter" },
  { arabic: "الْمُعِزُّ", translit: "Al-Mu'izz", meaning: "The Bestower of Honor" },
  { arabic: "الْمُذِلُّ", translit: "Al-Mudhill", meaning: "The Humiliator" },
  { arabic: "السَّمِيعُ", translit: "As-Sami'", meaning: "The All-Hearing" },
  { arabic: "الْبَصِيرُ", translit: "Al-Basir", meaning: "The All-Seeing" },
  { arabic: "الْحَكَمُ", translit: "Al-Hakam", meaning: "The Impartial Judge" },
  { arabic: "الْعَدْلُ", translit: "Al-'Adl", meaning: "The Utterly Just" },
  { arabic: "اللَّطِيفُ", translit: "Al-Lateef", meaning: "The Subtle One" },
  { arabic: "الْخَبِيرُ", translit: "Al-Khabeer", meaning: "The All-Aware" },
  { arabic: "الْحَلِيمُ", translit: "Al-Haleem", meaning: "The Forbearing" },
  { arabic: "الْعَظِيمُ", translit: "Al-'Azeem", meaning: "The Magnificent" },
  { arabic: "الْغَفُورُ", translit: "Al-Ghafoor", meaning: "The All-Forgiving" },
  { arabic: "الشَّكُورُ", translit: "Ash-Shakoor", meaning: "The Most Appreciative" },
  { arabic: "الْعَلِيُّ", translit: "Al-'Alee", meaning: "The Most High" },
  { arabic: "الْكَبِيرُ", translit: "Al-Kabeer", meaning: "The Greatest" },
  { arabic: "الْحَفِيظُ", translit: "Al-Hafeez", meaning: "The All-Preserving" },
  { arabic: "الْمُقِيتُ", translit: "Al-Muqeet", meaning: "The Sustainer" },
  { arabic: "الْحَسِيبُ", translit: "Al-Haseeb", meaning: "The Reckoner" },
  { arabic: "الْجَلِيلُ", translit: "Al-Jaleel", meaning: "The Majestic" },
  { arabic: "الْكَرِيمُ", translit: "Al-Kareem", meaning: "The Most Generous" },
  { arabic: "الرَّقِيبُ", translit: "Ar-Raqeeb", meaning: "The Watchful One" },
  { arabic: "الْمُجِيبُ", translit: "Al-Mujeeb", meaning: "The Responsive One" },
  { arabic: "الْوَاسِعُ", translit: "Al-Wasi'", meaning: "The All-Encompassing" },
  { arabic: "الْحَكِيمُ", translit: "Al-Hakeem", meaning: "The All-Wise" },
  { arabic: "الْوَدُودُ", translit: "Al-Wadud", meaning: "The Most Loving" },
  { arabic: "الْمَجِيدُ", translit: "Al-Majeed", meaning: "The Glorious" },
  { arabic: "الْبَاعِثُ", translit: "Al-Ba'ith", meaning: "The Resurrector" },
  { arabic: "الشَّهِيدُ", translit: "Ash-Shaheed", meaning: "The Witness" },
  { arabic: "الْحَقُّ", translit: "Al-Haqq", meaning: "The Absolute Truth" },
  { arabic: "الْوَكِيلُ", translit: "Al-Wakeel", meaning: "The Trustee" },
  { arabic: "الْقَوِيُّ", translit: "Al-Qawiyy", meaning: "The All-Strong" },
  { arabic: "الْمَتِينُ", translit: "Al-Mateen", meaning: "The Firm" },
  { arabic: "الْوَلِيُّ", translit: "Al-Waliyy", meaning: "The Protecting Friend" },
  { arabic: "الْحَمِيدُ", translit: "Al-Hameed", meaning: "The All-Praiseworthy" },
  { arabic: "الْمُحْصِي", translit: "Al-Muhsi", meaning: "The All-Enumerating" },
  { arabic: "الْمُبْدِئُ", translit: "Al-Mubdi'", meaning: "The Originator" },
  { arabic: "الْمُعِيدُ", translit: "Al-Mu'eed", meaning: "The Restorer" },
  { arabic: "الْمُحْيِي", translit: "Al-Muhyi", meaning: "The Giver of Life" },
  { arabic: "الْمُمِيتُ", translit: "Al-Mumeet", meaning: "The Bringer of Death" },
  { arabic: "الْحَيُّ", translit: "Al-Hayy", meaning: "The Ever-Living" },
  { arabic: "الْقَيُّومُ", translit: "Al-Qayyum", meaning: "The Sustainer of All" },
  { arabic: "الْوَاجِدُ", translit: "Al-Wajid", meaning: "The Perceiver" },
  { arabic: "الْمَاجِدُ", translit: "Al-Majid", meaning: "The Illustrious" },
  { arabic: "الْوَاحِدُ", translit: "Al-Wahid", meaning: "The One" },
  { arabic: "الْأَحَدُ", translit: "Al-Ahad", meaning: "The Unique" },
  { arabic: "السَّمَدُ", translit: "As-Samad", meaning: "The Eternal Refuge" },
  { arabic: "الْقَادِرُ", translit: "Al-Qadir", meaning: "The All-Powerful" },
  { arabic: "الْمُقْتَدِرُ", translit: "Al-Muqtadir", meaning: "The All-Determiner" },
  { arabic: "الْمُقَدِّمُ", translit: "Al-Muqaddim", meaning: "The Expediter" },
  { arabic: "الْمُؤَخِّرُ", translit: "Al-Mu'akhkhir", meaning: "The Delayer" },
  { arabic: "الْأَوَّلُ", translit: "Al-Awwal", meaning: "The First" },
  { arabic: "الْآخِرُ", translit: "Al-Akhir", meaning: "The Last" },
  { arabic: "الظَّاهِرُ", translit: "Az-Zahir", meaning: "The Manifest" },
  { arabic: "الْبَاطِنُ", translit: "Al-Batin", meaning: "The Hidden" },
  { arabic: "الْوَالِي", translit: "Al-Wali", meaning: "The Governor" },
  { arabic: "الْمُتَعَالِي", translit: "Al-Muta'ali", meaning: "The Most Exalted" },
  { arabic: "الْبَرُّ", translit: "Al-Barr", meaning: "The Most Kind" },
  { arabic: "التَّوَّابُ", translit: "At-Tawwab", meaning: "The Accepter of Repentance" },
  { arabic: "الْمُنْتَقِمُ", translit: "Al-Muntaqim", meaning: "The Avenger" },
  { arabic: "الْعَفُوُّ", translit: "Al-'Afuww", meaning: "The Pardoner" },
  { arabic: "الرَّؤُوفُ", translit: "Ar-Ra'uf", meaning: "The Most Kind" },
  { arabic: "مَالِكُ الْمُلْكِ", translit: "Malik-ul-Mulk", meaning: "Master of the Kingdom" },
  { arabic: "ذُو الْجَلَالِ وَالْإِكْرَامِ", translit: "Dhul-Jalali wal-Ikram", meaning: "Lord of Majesty and Bounty" },
  { arabic: "الْمُقْسِطُ", translit: "Al-Muqsit", meaning: "The Equitable" },
  { arabic: "الْجَامِعُ", translit: "Al-Jami'", meaning: "The Gatherer" },
  { arabic: "الْغَنِيُّ", translit: "Al-Ghaniyy", meaning: "The Self-Sufficient" },
  { arabic: "الْمُغْنِي", translit: "Al-Mughni", meaning: "The Enricher" },
  { arabic: "الْمَانِعُ", translit: "Al-Mani'", meaning: "The Preventer" },
  { arabic: "الضَّارُّ", translit: "Ad-Darr", meaning: "The Distresser" },
  { arabic: "النَّافِعُ", translit: "An-Nafi'", meaning: "The Benefactor" },
  { arabic: "النُّورُ", translit: "An-Nur", meaning: "The Light" },
  { arabic: "الْهَادِي", translit: "Al-Hadi", meaning: "The Guide" },
  { arabic: "الْبَدِيعُ", translit: "Al-Badi'", meaning: "The Incomparable" },
  { arabic: "الْبَاقِي", translit: "Al-Baqi", meaning: "The Everlasting" },
  { arabic: "الْوَارِثُ", translit: "Al-Warith", meaning: "The Inheritor" },
  { arabic: "الرَّشِيدُ", translit: "Ar-Rasheed", meaning: "The Guide to the Right Path" },
  { arabic: "الصَّبُورُ", translit: "As-Sabur", meaning: "The Patient One" },
];

// speak() is imported from ../utils/speak (robust mobile-friendly speech helper)

export default function NamesOfAllah() {
  const [query, setQuery] = useState("");

  const filtered = NAMES.filter((n) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      n.translit.toLowerCase().includes(q) || n.meaning.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-5 max-w-screen-md mx-auto pt-6">
      <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 mb-4">
        <ChevronLeft className="w-4 h-4" /> Home
      </Link>
      <h2 className="text-2xl font-extrabold text-rose-800 mb-1 text-center">
        99 Names of Allah
      </h2>
      <p className="text-gray-500 text-sm mb-5 text-center">
        Asma ul Husna — tap the speaker to hear each name.
      </p>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a name or meaning…"
          aria-label="Search the 99 Names of Allah"
          className="w-full pl-10 pr-4 py-2.5 rounded-full border border-rose-100 bg-white text-sm focus:ring-2 focus:ring-rose-300 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-24">
        {filtered.map((name, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl shadow-sm border border-rose-100 flex items-center gap-3 animate-fade-up"
          >
            <div className="flex-1">
              <span className="text-2xl font-arabic text-rose-600 block leading-tight">
                {name.arabic}
              </span>
              <span className="font-bold text-gray-800 text-sm">{name.translit}</span>
              <span className="text-xs text-gray-500 block">{name.meaning}</span>
            </div>
            <button
              onClick={() => speak(name.arabic)}
              className="p-2 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors shrink-0"
              aria-label={`Pronounce ${name.translit}`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-gray-400 text-sm">No names match your search.</p>
      )}
    </div>
  );
}
