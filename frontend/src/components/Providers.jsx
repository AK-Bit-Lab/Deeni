"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { useConnect, useAccount } from "wagmi";
import { config } from "../wagmiConfig";

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
