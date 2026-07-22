// Central configuration for the Deeni Mini App.
// Replace DEENI_SUBSCRIPTION_ADDRESS with your deployed contract address on Celo / Celo Sepolia.

// Deployed DeeniSubscription contract on Celo mainnet.
export const DEENI_SUBSCRIPTION_ADDRESS =
  "0x0a254916F73A7b426abEEf24CEbC4bCAfD3a3aDD";

// DeeniDeeds contract — on-chain daily deeds tracker.
// Deployed on Celo mainnet.
export const DEENI_DEEDS_ADDRESS =
  "0xC8E75f3a0F1795FE4B60Fd18634657B6B98254A5";

// DeeniQuiz contract — on-chain knowledge test results.
// Deployed on Celo mainnet.
export const DEENI_QUIZ_ADDRESS =
  "0x12d3c130f4BdcEa1759A64399c3223Bbad1957c0";

// DeeniQaidaProgress contract — on-chain Qaida lesson completion tracker.
// Deployed on Celo mainnet.
export const QAIDA_PROGRESS_ADDRESS =
  "0x56b519312abb33f3a19f1bd5381218d283d52759";

// 5 CELO subscription fee, matching the smart contract constant.
export const SUBSCRIPTION_FEE_CELO = 5;

// ABI for DeeniSubscription.sol
export const DEENI_ABI = [
  {
    type: "function",
    name: "isSubscribed",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getExpiry",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "trialClaimed",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "subscriptionExpiry",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasClaimedTrial",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "SUBSCRIPTION_FEE",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "startFreeTrial",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "paySubscription",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "event",
    name: "TrialStarted",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "expiry", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "SubscriptionPaid",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "newExpiry", type: "uint256", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
];

// Deed type definitions (must match DeeniDeeds.sol)
export const DEED_TYPES = [
  { id: 0, key: "quran", label: "Quran Recitation", icon: "📖", unit: "pages", defaultCount: 1 },
  { id: 1, key: "dua", label: "Dua", icon: "🤲", unit: "times", defaultCount: 1 },
  { id: 2, key: "dhikr", label: "Dhikr", icon: "📿", unit: "reps", defaultCount: 33 },
  { id: 3, key: "salah", label: "Salah (Prayer)", icon: "🕌", unit: "rakats", defaultCount: 5 },
  { id: 4, key: "fasting", label: "Fasting", icon: "🌙", unit: "day", defaultCount: 1 },
  { id: 5, key: "charity", label: "Charity / Sadaqah", icon: "🤝", unit: "times", defaultCount: 1 },
  { id: 6, key: "learning", label: "Learning Arabic", icon: "📚", unit: "letters", defaultCount: 1 },
  { id: 7, key: "names", label: "99 Names of Allah", icon: "✨", unit: "names", defaultCount: 1 },
];

// ABI for DeeniDeeds.sol
export const DEEDS_ABI = [
  {
    type: "function",
    name: "recordDeed",
    inputs: [
      { name: "deedType", type: "uint8" },
      { name: "count", type: "uint32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "recordedToday",
    inputs: [
      { name: "user", type: "address" },
      { name: "deedType", type: "uint8" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "deedCount",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalDeeds",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getStats",
    inputs: [
      { name: "user", type: "address" },
      { name: "deedType", type: "uint8" },
    ],
    outputs: [
      { name: "total", type: "uint32" },
      { name: "streak", type: "uint32" },
      { name: "best", type: "uint32" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDeeds",
    inputs: [
      { name: "user", type: "address" },
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" },
    ],
    outputs: [{ name: "page", type: "tuple[]", components: [
      { name: "deedType", type: "uint8" },
      { name: "count", type: "uint32" },
      { name: "timestamp", type: "uint64" },
    ]}],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "DeedRecorded",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "deedType", type: "uint8", indexed: true },
      { name: "count", type: "uint32", indexed: false },
      { name: "timestamp", type: "uint64", indexed: false },
      { name: "newStreak", type: "uint32", indexed: false },
    ],
  },
];

// Quiz topic definitions (must match DeeniQuiz.sol topic IDs 0-9)
export const QUIZ_TOPICS = [
  { id: 0, key: "quran", label: "Quran", icon: "📖" },
  { id: 1, key: "tajweed", label: "Tajweed", icon: "🔤" },
  { id: 2, key: "letters", label: "Arabic Letters", icon: "ا" },
  { id: 3, key: "pillars", label: "Pillars of Islam", icon: "🕌" },
  { id: 4, key: "iman", label: "Pillars of Iman", icon: "💚" },
  { id: 5, key: "prophets", label: "Prophets", icon: "🌟" },
  { id: 6, key: "seerah", label: "Seerah", icon: "📜" },
  { id: 7, key: "fiqh", label: "Fiqh / Salah", icon: "🧭" },
  { id: 8, key: "hadith", label: "Hadith", icon: "📚" },
  { id: 9, key: "general", label: "General Knowledge", icon: "🧠" },
];

// ABI for DeeniQuiz.sol
export const QUIZ_ABI = [
  {
    type: "function",
    name: "submitQuiz",
    inputs: [
      { name: "topic", type: "uint8" },
      { name: "score", type: "uint16" },
      { name: "total", type: "uint16" },
      { name: "questionHash", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resultCount",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalQuizzes",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBest",
    inputs: [
      { name: "user", type: "address" },
      { name: "topic", type: "uint8" },
    ],
    outputs: [
      { name: "bestS", type: "uint16" },
      { name: "bestT", type: "uint16" },
      { name: "tries", type: "uint32" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getResults",
    inputs: [
      { name: "user", type: "address" },
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" },
    ],
    outputs: [{ name: "page", type: "tuple[]", components: [
      { name: "topic", type: "uint8" },
      { name: "score", type: "uint16" },
      { name: "total", type: "uint16" },
      { name: "questionHash", type: "bytes32" },
      { name: "timestamp", type: "uint64" },
    ]}],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "QuizSubmitted",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "topic", type: "uint8", indexed: true },
      { name: "score", type: "uint16", indexed: false },
      { name: "total", type: "uint16", indexed: false },
      { name: "questionHash", type: "bytes32", indexed: false },
      { name: "timestamp", type: "uint64", indexed: false },
    ],
  },
];

// ABI for DeeniQaidaProgress.sol
export const QAIDA_PROGRESS_ABI = [
  {
    type: "function",
    name: "completeLesson",
    inputs: [{ name: "lessonId", type: "uint8" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "completed",
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "uint8" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "highestLesson",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalCompletions",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "logCount",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getProgress",
    inputs: [
      { name: "user", type: "address" },
      { name: "lessonId", type: "uint8" },
    ],
    outputs: [
      { name: "highest", type: "uint8" },
      { name: "total", type: "uint256" },
      { name: "isCompleted", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLogs",
    inputs: [
      { name: "user", type: "address" },
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" },
    ],
    outputs: [{ name: "page", type: "tuple[]", components: [
      { name: "lessonId", type: "uint8" },
      { name: "timestamp", type: "uint64" },
    ]}],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "LessonCompleted",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "lessonId", type: "uint8", indexed: true },
      { name: "timestamp", type: "uint64", indexed: false },
    ],
  },
];

// Detect whether the app is running inside the MiniPay wallet.
export function isMiniPay() {
  return typeof window !== "undefined" && window.ethereum && window.ethereum.isMiniPay;
}
