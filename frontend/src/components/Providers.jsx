"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { celo, celoSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { useConnect, useAccount } from "wagmi";

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

const queryClient = new QueryClient();

// Auto-connects to the injected provider when running inside MiniPay,
// or when a previous wagmi connection is cached. On a regular web browser
// the user connects manually via the "Connect Wallet" button in the guard.
function AutoConnect({ children }) {
  const { connect, connectors, status } = useConnect();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) return;
    // MiniPay exposes window.ethereum.isMiniPay — connect implicitly.
    if (typeof window !== "undefined" && window.ethereum && window.ethereum.isMiniPay) {
      connect({ connector: connectors[0] });
      return;
    }
    // Reconnect if wagmi previously connected (status !== 'disconnected' means reconnecting).
    if (status === "reconnecting") {
      connect({ connector: connectors[0] });
    }
  }, [connect, connectors, isConnected, status]);

  return <>{children}</>;
}

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AutoConnect>{children}</AutoConnect>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
