import { createConfig, http } from "wagmi";
import { celo, celoSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Wagmi config lives in its own module (rather than inside Providers.jsx)
// so that file only exports the Providers component — this keeps Vite's
// React Fast Refresh working correctly, since a file mixing component and
// non-component exports forces a full reload on every edit.
export const config = createConfig({
  // Celo mainnet first (production). MiniPay on mainnet uses celo.
  // Keep celoSepolia available for testnet developer testing.
  chains: [celo, celoSepolia],
  // `injected()` with no target picks up any injected EIP-1193 provider:
  // MiniPay, MetaMask, Valora, Celo Wallet, etc.
  connectors: [injected()],
  transports: {
    [celo.id]: http(),
    [celoSepolia.id]: http(),
  },
  ssr: false,
});
