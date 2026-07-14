// Central configuration for the Deeni Mini App.
// Replace DEENI_SUBSCRIPTION_ADDRESS with your deployed contract address on Celo / Celo Sepolia.

// Deployed DeeniSubscription contract on Celo mainnet.
export const DEENI_SUBSCRIPTION_ADDRESS =
  "0x0a254916F73A7b426abEEf24CEbC4bCAfD3a3aDD";

// DeeniDeeds contract — on-chain daily deeds tracker.
// TODO: set after deploying DeeniDeeds.sol
export const DEENI_DEEDS_ADDRESS =
  "0x0000000000000000000000000000000000000000";

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

// Detect whether the app is running inside the MiniPay wallet.
export function isMiniPay() {
  return typeof window !== "undefined" && window.ethereum && window.ethereum.isMiniPay;
}
