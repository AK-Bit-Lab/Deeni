import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

// Approximate nisab thresholds (USD). Nisab = value of 85g of gold OR 595g of silver.
// Gold nisab is the stricter (lower) threshold commonly used.
const GOLD_PRICE_PER_GRAM = 65; // USD/g — update with a live feed in production
const SILVER_PRICE_PER_GRAM = 0.8; // USD/g
const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;

const ZAKAT_RATE = 0.025;

export default function ZakatCalculator() {
  const [goldGrams, setGoldGrams] = useState("");
  const [silverGrams, setSilverGrams] = useState("");
  const [cash, setCash] = useState("");
  const [investments, setInvestments] = useState("");
  const [business, setBusiness] = useState("");
  const [debts, setDebts] = useState("");
  const [useGoldNisab, setUseGoldNisab] = useState(true);

  const goldValue = (parseFloat(goldGrams) || 0) * GOLD_PRICE_PER_GRAM;
  const silverValue = (parseFloat(silverGrams) || 0) * SILVER_PRICE_PER_GRAM;
  const cashValue = parseFloat(cash) || 0;
  const invValue = parseFloat(investments) || 0;
  const bizValue = parseFloat(business) || 0;
  const debtValue = parseFloat(debts) || 0;

  const totalAssets = goldValue + silverValue + cashValue + invValue + bizValue;
  const totalWealth = Math.max(0, totalAssets - debtValue);

  const goldNisab = GOLD_NISAB_GRAMS * GOLD_PRICE_PER_GRAM;
  const silverNisab = SILVER_NISAB_GRAMS * SILVER_PRICE_PER_GRAM;
  const nisab = useGoldNisab ? goldNisab : silverNisab;

  const eligible = totalWealth >= nisab;
  const zakatDue = eligible ? totalWealth * ZAKAT_RATE : 0;

  const field = (label, value, setter, placeholder) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => setter(e.target.value)}
          className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
          placeholder={placeholder}
        />
      </div>
    </div>
  );

  return (
    <div className="p-5 max-w-md mx-auto pt-6">
      <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 mb-4">
        <ChevronLeft className="w-4 h-4" /> Home
      </Link>
      <h2 className="text-2xl font-extrabold text-amber-700 mb-1">Zakat Calculator</h2>
      <p className="text-gray-500 text-sm mb-6">
        Calculate your annual Zakat (2.5%) based on your eligible wealth.
      </p>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100 space-y-4">
        {field("Gold (grams)", goldGrams, setGoldGrams, "0")}
        {field("Silver (grams)", silverGrams, setSilverGrams, "0")}
        {field("Cash & Bank", cash, setCash, "0.00")}
        {field("Investments / Stocks", investments, setInvestments, "0.00")}
        {field("Business Inventory", business, setBusiness, "0.00")}
        {field("Outstanding Debts (deducted)", debts, setDebts, "0.00")}

        {/* Nisab basis toggle */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-gray-500">Nisab basis:</span>
          <button
            onClick={() => setUseGoldNisab(true)}
            className={`text-xs px-3 py-1 rounded-full ${
              useGoldNisab ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700"
            }`}
          >
            Gold
          </button>
          <button
            onClick={() => setUseGoldNisab(false)}
            className={`text-xs px-3 py-1 rounded-full ${
              !useGoldNisab ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700"
            }`}
          >
            Silver
          </button>
        </div>

        <div className="mt-2 p-4 bg-amber-50 rounded-xl space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Wealth:</span>
            <span className="font-semibold">${totalWealth.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Nisab Threshold:</span>
            <span className="font-semibold">${nisab.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-amber-200 flex justify-between items-center">
            <span className="font-medium text-amber-900">Zakat Due (2.5%):</span>
            <span className="text-2xl font-extrabold text-amber-600">
              ${zakatDue.toFixed(2)}
            </span>
          </div>
          {!eligible && (
            <p className="text-xs text-gray-500 pt-1">
              Your wealth is below the nisab threshold — no Zakat is due.
            </p>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3 text-center">
        Gold/silver prices are approximate. Update with live rates for precise figures.
      </p>
    </div>
  );
}
