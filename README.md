# ☪️ Deeni - Your Path of Light

> **Deeni** (ديني - *"my religion"*) is a fully on-chain Islamic Mini App for the **Celo MiniPay** stablecoin wallet - and any web browser with an injected wallet. Every action a user takes is recorded on-chain, so users pay gas on Celo and build an immutable, verifiable spiritual log.

<p align="center">
  <img src="frontend/public/favicon.svg" width="80" alt="Deeni logo" />
</p>

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔥 **Daily Deeds** | Record daily worship on-chain - Quran recitation, dua, dhikr, salah, fasting, charity, learning, 99 Names. Tracks streaks, best streaks, and totals. Every record is a real Celo transaction. |
| 📖 **Learn Arabic** | A 4-stage curriculum - the 28 letters, harakat (vowel marks), Tajweed basics, and joining letters into words - with audio pronunciation (Web Speech API) & transliteration. |
| 🧭 **Qibla Finder** | Live compass that points to the Kaaba using geolocation + device orientation (Haversine bearing). |
| 🕌 **Hijri Calendar** | Accurate tabular Gregorian → Hijri conversion with a navigable month grid. |
| 💰 **Zakat Calculator** | Gold, silver, cash, investments, business assets & debts with nisab threshold check (2.5%). |
| ✨ **99 Names of Allah** | All 99 Asma ul Husna with Arabic text, transliteration, meaning, audio & search. |
| 🏆 **Knowledge Test** | 10-topic Islamic quiz bank recorded on-chain (best score, attempt history) via `DeeniQuiz.sol`. |
| 📿 **Tasbih Counter** | Tap-to-count dhikr with presets, haptic feedback, and persisted cycle/all-time totals. |
| 🌗 **Dark mode** | System-aware light/dark theme toggle, persisted per device. |
| 🔐 **On-chain Subscription** | 1-month free trial, then **5 CELO / month**. Fully managed by an on-chain smart contract. |

## 📈 Latest Improvements

- **Qaida Lesson Completion Contract**: Added `DeeniQaidaProgress.sol` to record lesson completions on-chain without the once‑per‑day restriction of `DeeniDeeds`. The contract tracks each lesson ID, timestamps, highest lesson completed, and total completions.
- **Frontend Integration**: New `useQaidaProgress` hook (`frontend/src/hooks/useQaidaProgress.js`) reads progress and writes lesson completions. The **ArabicLearning** component now requires an on‑chain signature when a wallet is connected, automatically advancing to the next lesson after the transaction confirms.
- **Auto‑Advance Fix**: The component now watches the transaction hash (`txHash`) so each new lesson triggers a page refresh and navigation without manual interaction.
- **Compass Fallback**: `useQiblaDirection` now marks the compass as unavailable after 6 seconds and shows a bearing fallback, preventing endless “Calibrating compass…” states.
- **Knowledge Test Bytes32 Fix**: Updated `hashQuestions()` to produce a proper 32‑byte hash, eliminating the `bytes24` size error.
- **Documentation Updates**: All em‑dashes have been replaced with hyphens throughout the README and codebase for consistency.

These improvements enhance the user experience, provide more flexible lesson tracking, and resolve previous bugs.

## 🏗️ Architecture

```
deeni/
├── contracts/
│   ├── DeeniSubscription.sol      # On-chain subscription (trial + 5 CELO/month)
│   ├── DeeniDeeds.sol             # On-chain daily deeds tracker (streaks + counts)
│   └── DeeniQuiz.sol              # On-chain knowledge test results (best score, history)
├── flattened/                     # Single-file contracts for CeloScan verification
│   ├── DeeniSubscription.sol
│   ├── DeeniDeeds.sol
│   ├── DeeniQuiz.sol
│   └── DeeniCombined.sol
└── frontend/
    ├── index.html                 # branding, fonts (Inter, Scheherazade New, Amiri), favicon, no-FOUC theme script
    ├── tailwind.config.js         # deeni color palette + Arabic fonts + class-based dark mode
    ├── vercel.json                # SPA rewrite so client-side routes survive a refresh on Vercel
    ├── .eslintrc.cjs              # ESLint (React + hooks) - run with `npm run lint`
    └── src/
        ├── App.jsx                # routes, home dashboard, dark mode toggle
        ├── wagmiConfig.js         # wagmi v2 chain/connector config (Celo + Celo Sepolia)
        ├── constants/index.js     # contract addresses + ABIs + DEED_TYPES + QUIZ_TOPICS + isMiniPay()
        ├── components/
        │   ├── Providers.jsx          # WagmiProvider/QueryClientProvider + MiniPay auto-connect
        │   ├── SubscriptionGuard.jsx  # on-chain gating (trial / pay) + Connect Wallet button
        │   ├── DailyDeeds.jsx         # on-chain deed recording UI with streaks
        │   ├── ArabicLearning.jsx     # 4-stage Quran reading curriculum + speech synthesis
        │   ├── QiblaFinder.jsx        # compass UI
        │   ├── ZakatCalculator.jsx    # multi-asset zakat
        │   ├── HijriCalendar.jsx      # tabular Hijri conversion
        │   ├── NamesOfAllah.jsx       # 99 names + audio + search
        │   ├── KnowledgeTest.jsx      # on-chain quiz (10 topics, question bank, history)
        │   └── TasbihCounter.jsx      # dhikr tap counter with presets + haptics
        ├── hooks/
        │   ├── useSubscription.js     # read/write subscription contract
        │   ├── useDeeds.js            # read/write deeds contract (streaks, counts)
        │   ├── useQuiz.js             # read/write quiz contract (best score, history)
        │   ├── useQiblaDirection.js   # geolocation + device orientation
        │   └── useTheme.js            # light/dark mode, persisted + system-aware
        └── utils/
            ├── speak.js               # speechSynthesis with Google TTS audio fallback (mobile webviews)
            └── formatTxError.js       # shared wallet/tx error → friendly message mapping
```

### Tech stack
- **React 18 + Vite** - fast SPA
- **wagmi v2 + viem** - Celo / Celo Sepolia wallet & contract calls
- **TanStack Query** - data fetching
- **Tailwind CSS** - styling
- **lucide-react** - icons
- **Web Speech API** - Arabic letter & name pronunciation (no audio files needed)
- **Device Orientation API** - live Qibla compass
- **Solidity ^0.8.20** - self-contained contracts (no external imports, Remix-friendly)

## 🌐 Dual-target: MiniPay + Web

Deeni runs in two environments:

| Environment | Wallet connection |
|-------------|-------------------|
| **Celo MiniPay** | Auto-connects via `window.ethereum.isMiniPay` - seamless, no button |
| **Web browser** (MetaMask, Valora, Celo Wallet, etc.) | Shows a **"Connect Wallet"** button on the welcome screen |

Both paths use the same wagmi `injected()` connector, so the on-chain subscription and deeds features work identically.

## 🚀 Getting started

### 1. Install & run the frontend
```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run lint     # ESLint check
npm run build    # production build (dist/)
```

### 2. Deploy the smart contracts
Open [`contracts/DeeniSubscription.sol`](contracts/DeeniSubscription.sol) and [`contracts/DeeniDeeds.sol`](contracts/DeeniDeeds.sol) in [Remix](https://remix.ethereum.org) and deploy to **Celo mainnet** (or Celo Sepolia for testing). Both contracts are self-contained - no remappings needed.

- **Value:** `0` (constructor takes no args)
- **Gas:** let Remix auto-estimate

### 3. Wire the contract addresses
After deploying, paste the addresses into [`frontend/src/constants/index.js`](frontend/src/constants/index.js):

```js
export const DEENI_SUBSCRIPTION_ADDRESS = "0x..."; // your DeeniSubscription address
export const DEENI_DEEDS_ADDRESS = "0x...";        // your DeeniDeeds address
```

Until the addresses are set, the app runs in **dev mode** (open access, no on-chain gating).

### 4. Verify on CeloScan
Use the flattened contracts in [`flattened/`](flattened/README.md) to verify your deployed contracts on https://celoscan.io (Solidity → Single file, compiler `v0.8.20`, license `MIT`).

## 📜 Smart contracts

### `DeeniSubscription`
- `startFreeTrial()` - one-time 30-day free trial
- `paySubscription()` - pay exactly 5 CELO for 30 more days
- `isSubscribed(user)` / `getExpiry(user)` / `trialClaimed(user)` - read access state
- `withdraw(to)` / `transferOwnership(newOwner)` - owner-only

### `DeeniDeeds`
- `recordDeed(deedType, count)` - record a daily deed on-chain (8 types: Quran, Dua, Dhikr, Salah, Fasting, Charity, Learning, 99 Names). One record per deed type per day. Updates streaks automatically.
- `recordedToday(user, deedType)` - check if already done today
- `getStats(user, deedType)` - total count, current streak, best streak
- `getDeeds(user, offset, limit)` - paginated deed log
- `DeedRecorded` event - emitted on every record for indexing

### `DeeniQuiz`
- `submitQuiz(topic, score, total, questionHash)` - record a completed quiz result on-chain (10 topics: Quran, Tajweed, Arabic Letters, Pillars of Islam, Pillars of Iman, Prophets, Seerah, Fiqh, Hadith, General Knowledge).
- `getBest(user, topic)` - best score, best total, and attempt count for a topic
- `getResults(user, offset, limit)` - paginated quiz history
- `totalQuizzes(user)` - lifetime quiz count

## 📄 License

MIT
