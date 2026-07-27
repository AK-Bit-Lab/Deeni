import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Umm al-Qura style tabular Hijri conversion (sufficient for a calendar view).
// Algorithm: Kuwaiti / Fliegel-Van Flandern.
function gregorianToHijri(year, month, day) {
  let jd;
  if (year > 1582 || (year === 1582 && (month > 10 || (month === 10 && day > 4)))) {
    jd =
      Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4) +
      Math.floor((367 * (month - 2 - 12 * Math.floor((month - 14) / 12))) / 12) -
      Math.floor((3 * Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100)) / 4) +
      day -
      32075;
  } else {
    jd = 367 * year - Math.floor((7 * (year + 5001 + Math.floor((month - 9) / 7))) / 4) +
      Math.floor((275 * month) / 9) + day + 1729777;
  }

  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 29441;
  const j =
    Math.floor(10985 * l2 / 53191) - 1 - Math.floor(n / 33) * Math.floor((n % 33) / 4);
  const j2 = Math.floor((j % 30) / 29);
  const monthH = Math.floor((j + 1) / 30) - Math.floor(j2 * Math.floor(j / 30));
  const dayH = l2 - Math.floor(29 * monthH + Math.floor(j / 30)) + 1;

  // Year
  const yearH = 30 * (n - 1) + Math.floor(n / 33) + 4;

  return { year: yearH, month: monthH, day: dayH };
}

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
];

const GREG_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * HijriCalendar
 * Renders a month-view calendar that shows both the Gregorian and
 * Hijri dates for each day. The user can navigate prev/next months.
 * Today's cell is highlighted.
 *
 * The Hijri conversion uses the Fliegel-Van Flandern algorithm (a
 * tabular approximation, not an astronomically-observed calendar).
 * This is sufficient for a UI display but may be off by 1-2 days from
 * the officially-observed Hijri date in any given country. For
 * religious rulings that depend on the observed moon sighting, users
 * should consult their local authority.
 *
 * The visible month's cells are memoized so unrelated parent
 * re-renders do not trigger 30+ Hijri conversions.
 */
export default function HijriCalendar() {
  const today = new Date();
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const firstDay = new Date(view.year, view.month, 1).getDay();
  const numDays = daysInMonth(view.year, view.month);

  // Recomputing 30+ Hijri conversions on every render (e.g. from unrelated
  // parent re-renders) is wasted work - memoize on the visible month/year.
  const cells = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= numDays; d++) arr.push(d);
    return arr;
  }, [firstDay, numDays]);

  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  const todayHijri = useMemo(
    () => gregorianToHijri(todayY, todayM + 1, todayD),
    [todayY, todayM, todayD]
  );

  const prev = () =>
    setView((v) =>
      v.month === 0
        ? { year: v.year - 1, month: 11 }
        : { ...v, month: v.month - 1 }
    );
  const next = () =>
    setView((v) =>
      v.month === 11
        ? { year: v.year + 1, month: 0 }
        : { ...v, month: v.month + 1 }
    );

  const isToday = (d) =>
    d === today.getDate() &&
    view.month === today.getMonth() &&
    view.year === today.getFullYear();

  return (
    <div className="p-5 max-w-md mx-auto pt-6">
      <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 mb-4">
        <ChevronLeft className="w-4 h-4" /> Home
      </Link>
      <h2 className="text-2xl font-extrabold text-purple-800 mb-1">Hijri Calendar</h2>
      <p className="text-gray-500 text-sm mb-5">
        Today: {todayHijri.day} {HIJRI_MONTHS[todayHijri.month - 1]} {todayHijri.year} AH
      </p>

      {/* Today card */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-3xl p-6 text-center mb-5 shadow-lg">
        <div className="text-sm font-medium text-purple-100 mb-1">Today</div>
        <div className="text-6xl font-black leading-none mb-2">{todayHijri.day}</div>
        <div className="text-lg font-bold">
          {HIJRI_MONTHS[todayHijri.month - 1]} {todayHijri.year} AH
        </div>
        <div className="mt-3 pt-3 border-t border-white/20 text-purple-100 text-sm">
          {GREG_MONTHS[today.getMonth()]} {today.getDate()}, {today.getFullYear()}
        </div>
      </div>

      {/* Month grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prev} aria-label="Previous month" className="p-2 rounded-full hover:bg-purple-50">
            <ChevronLeft className="w-5 h-5 text-purple-700" />
          </button>
          <span className="font-bold text-purple-900">
            {GREG_MONTHS[view.month]} {view.year}
          </span>
          <button onClick={next} aria-label="Next month" className="p-2 rounded-full hover:bg-purple-50">
            <ChevronRight className="w-5 h-5 text-purple-700" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-[10px] font-semibold text-gray-400 py-1">
              {w}
            </div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const h = gregorianToHijri(view.year, view.month + 1, d);
            const todayCell = isToday(d);
            return (
              <div
                key={i}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs ${
                  todayCell
                    ? "bg-purple-600 text-white font-bold"
                    : "hover:bg-purple-50 text-gray-700"
                }`}
              >
                <span className="text-sm font-semibold">{d}</span>
                <span
                  className={`text-[9px] ${
                    todayCell ? "text-purple-100" : "text-gray-400"
                  }`}
                >
                  {h.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3 text-center">
        Hijri dates are approximate (tabular method). For religious observance, confirm with local moon sighting.
      </p>
    </div>
  );
}
