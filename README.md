# ☪️ Deeni — Your Path of Light

> **Deeni** (ديني — *"my religion"*) is a fully on-chain Islamic Mini App for the **Celo MiniPay** stablecoin wallet — and any web browser with an injected wallet. Every action a user takes is recorded on-chain, so users pay gas on Celo and build an immutable, verifiable spiritual log.

<p align="center">
  <img src="frontend/public/favicon.svg" width="80" alt="Deeni logo" />
</p>

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔥 **Daily Deeds** | Record daily worship on-chain — Quran recitation, dua, dhikr, salah, fasting, charity, learning, 99 Names. Tracks streaks, best streaks, and totals. Every record is a real Celo transaction. |
| 📖 **Learn Arabic** | The full 28-letter Arabic alphabet with audio pronunciation (Web Speech API) & transliteration. |
| 🧭 **Qibla Finder** | Live compass that points to the Kaaba using geolocation + device orientation (Haversine bearing). |
| 🕌 **Hijri Calendar** | Accurate tabular Gregorian → Hijri conversion with a navigable month grid. |
| 💰 **Zakat Calculator** | Gold, silver, cash, investments, business assets & debts with nisab threshold check (2.5%). |
| ✨ **99 Names of Allah** | All 99 Asma ul Husna with Arabic text, transliteration, meaning, audio & search. |
| 🔐 **On-chain Subscription** | 1-month free trial, then **5 CELO / month**. Fully managed by an on-chain smart contract. |

## 🏗️ Architecture

```
deeni/
├── contracts/
│   ├── DeeniSubscription.sol      # On-chain subscription (trial + 5 CELO/month)
│   └── DeeniDeeds.sol             # On-chain daily deeds tracker (streaks + counts)
├── flattened/                     # Single-file contracts for CeloScan verification
│   ├── DeeniSubscription.sol
│   ├── DeeniDeeds.sol
│   └── DeeniCombined.sol
└── frontend/
    ├── index.html                 # branding, fonts (Inter, Scheherazade New, Amiri), favicon
    ├── tailwind.config.js         # deeni color palette + Arabic fonts
    └── src/
        ├── App.jsx                # routes, home dashboard, bottom nav
        ├── constants/index.js     # contract addresses + ABIs + DEED_TYPES + isMiniPay()
        ├── components/
        │   ├── Providers.jsx          # wagmi v2 config + MiniPay auto-connect + web wallet
        │   ├── SubscriptionGuard.jsx  # on-chain gating (trial / pay) + Connect Wallet button
        │   ├── DailyDeeds.jsx         # on-chain deed recording UI with streaks
        │   ├── ArabicLearning.jsx     # 28 letters + speech synthesis
        │   ├── QiblaFinder.jsx        # compass UI
        │   ├── ZakatCalculator.jsx    # multi-asset zakat
        │   ├── HijriCalendar.jsx      # tabular Hijri conversion
        │   └── NamesOfAllah.jsx       # 99 names + audio + search
        └── hooks/
            ├── useSubscription.js     # read/write subscription contract
            ├── useDeeds.js            # read/write deeds contract (streaks, counts)
            └── useQiblaDirection.js   # geolocation + device orientation
```

### Tech stack
- **React 18 + Vite** — fast SPA
- **wagmi v2 + viem** — Celo / Celo Sepolia wallet & contract calls
- **TanStack Query** — data fetching
- **Tailwind CSS** — styling
- **lucide-react** — icons
- **Web Speech API** — Arabic letter & name pronunciation (no audio files needed)
- **Device Orientation API** — live Qibla compass
- **Solidity ^0.8.20** — self-contained contracts (no external imports, Remix-friendly)

## 🌐 Dual-target: MiniPay + Web

Deeni runs in two environments:

| Environment | Wallet connection |
|-------------|-------------------|
| **Celo MiniPay** | Auto-connects via `window.ethereum.isMiniPay` — seamless, no button |
| **Web browser** (MetaMask, Valora, Celo Wallet, etc.) | Shows a **"Connect Wallet"** button on the welcome screen |

Both paths use the same wagmi `injected()` connector, so the on-chain subscription and deeds features work identically.

## 🚀 Getting started

### 1. Install & run the frontend
```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

### 2. Deploy the smart contracts
Open [`contracts/DeeniSubscription.sol`](contracts/DeeniSubscription.sol) and [`contracts/DeeniDeeds.sol`](contracts/DeeniDeeds.sol) in [Remix](https://remix.ethereum.org) and deploy to **Celo mainnet** (or Celo Sepolia for testing). Both contracts are self-contained — no remappings needed.

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
- `startFreeTrial()` — one-time 30-day free trial
- `paySubscription()` — pay exactly 5 CELO for 30 more days
- `isSubscribed(user)` / `getExpiry(user)` / `trialClaimed(user)` — read access state
- `withdraw(to)` / `transferOwnership(newOwner)` — owner-only

### `DeeniDeeds`
- `recordDeed(deedType, count)` — record a daily deed on-chain (8 types: Quran, Dua, Dhikr, Salah, Fasting, Charity, Learning, 99 Names). One record per deed type per day. Updates streaks automatically.
- `recordedToday(user, deedType)` — check if already done today
- `getStats(user, deedType)` — total count, current streak, best streak
- `getDeeds(user, offset, limit)` — paginated deed log
- `DeedRecorded` event — emitted on every record for indexing

## 📄 License

MIT
