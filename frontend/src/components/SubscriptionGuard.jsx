import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { useSubscription } from "../hooks/useSubscription";
import { isMiniPay, DEENI_SUBSCRIPTION_ADDRESS } from "../constants";

function formatExpiry(ts) {
  if (!ts) return null;
  const d = new Date(ts * 1000);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysLeft(ts) {
  if (!ts) return 0;
  const diff = ts * 1000 - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function SubscriptionGuard({ children }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting, error: connectError } = useConnect();
  const {
    isSubscribed,
    expiry,
    trialClaimed,
    subLoading,
    startTrial,
    paySubscription,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  } = useSubscription();

  const [showPaywall, setShowPaywall] = useState(false);

  // We treat the contract as "configured" only when the constant is non-zero.
  // While the address is still the placeholder (all zeros), we allow access
  // so the UI can be developed/tested before deployment.
  const CONTRACT_ZERO = /^0x0+$/.test(DEENI_SUBSCRIPTION_ADDRESS);
  const contractConfigured = !!address && !/^0x0+$/.test(address) && !CONTRACT_ZERO;

  useEffect(() => {
    if (!isConnected) return;
    if (CONTRACT_ZERO) return; // dev mode: open access
    if (!subLoading && !isSubscribed) setShowPaywall(true);
    else setShowPaywall(false);
  }, [isConnected, isSubscribed, subLoading, CONTRACT_ZERO]);

  // Not connected
  if (!isConnected) {
    const hasInjected =
      typeof window !== "undefined" && !!window.ethereum;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gradient-to-b from-emerald-50 to-white">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center mb-6 shadow-lg">
          <span className="text-4xl">☪️</span>
        </div>
        <h1 className="text-3xl font-extrabold text-deeni-dark mb-2">
          Welcome to Deeni
        </h1>
        <p className="text-gray-600 mb-6 max-w-xs">
          Your fully on-chain Islamic companion — learn Arabic, find Qibla,
          calculate Zakat and more.
        </p>

        {isMiniPay() ? (
          <p className="text-sm text-emerald-600 mt-4">
            Connecting to MiniPay wallet…
          </p>
        ) : hasInjected ? (
          <div className="w-full max-w-xs">
            <button
              onClick={() => connect({ connector: connectors[0] })}
              disabled={isConnecting}
              className="w-full py-3.5 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-60"
            >
              {isConnecting ? "Connecting…" : "Connect Wallet"}
            </button>
            <p className="text-xs text-gray-400 mt-3">
              Connect with MetaMask, Valora, Celo Wallet or any injected wallet.
            </p>
            {connectError && (
              <p className="text-xs text-red-600 mt-2">
                {connectError.shortMessage || connectError.message}
              </p>
            )}
          </div>
        ) : (
          <div className="w-full max-w-xs">
            <p className="text-sm text-gray-500 mb-4">
              No wallet detected. Install a Celo-compatible wallet extension
              to continue.
            </p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block py-3 px-5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Install MetaMask
            </a>
            <p className="text-xs text-gray-400 mt-4">
              Or open this app inside the MiniPay wallet on Celo.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Dev mode (contract not deployed yet) — open access
  if (CONTRACT_ZERO) {
    return (
      <>
        {children}
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-800 text-xs px-3 py-1.5 rounded-full shadow z-40">
          Dev mode — set contract address to enable on-chain subscription
        </div>
      </>
    );
  }

  if (subLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Checking your subscription…</p>
      </div>
    );
  }

  // Subscribed — show app + status badge
  if (isSubscribed && !showPaywall) {
    return (
      <>
        {children}
        {expiry > 0 && (
          <div className="fixed top-3 right-3 bg-emerald-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow z-40">
            {daysLeft(expiry)}d left
          </div>
        )}
      </>
    );
  }

  // Paywall
  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen text-center bg-gradient-to-b from-emerald-50 to-white">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-100 max-w-sm w-full animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center mx-auto mb-5 shadow">
          <span className="text-3xl">☪️</span>
        </div>
        <h2 className="text-2xl font-extrabold text-emerald-800 mb-2">
          Subscribe to Deeni
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          Get full access to Arabic learning, Qibla compass, Zakat calculator,
          Hijri calendar and the 99 Names of Allah — fully on-chain.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
            {error.shortMessage || error.message}
          </div>
        )}

        {isConfirmed && (
          <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-xl">
            ✅ Transaction confirmed! Reloading…
          </div>
        )}

        <div className="space-y-4">
          {!trialClaimed && (
            <button
              onClick={startTrial}
              disabled={isPending || isConfirming}
              className="w-full py-3.5 px-4 bg-emerald-100 text-emerald-800 font-semibold rounded-xl hover:bg-emerald-200 transition-colors disabled:opacity-60"
            >
              {isPending || isConfirming ? "Processing…" : "Start 1-Month Free Trial"}
            </button>
          )}

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-200" />
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <button
            onClick={paySubscription}
            disabled={isPending || isConfirming}
            className="w-full py-3.5 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-60"
          >
            {isPending || isConfirming ? "Processing…" : "Pay 5 CELO (30 Days)"}
          </button>
        </div>

        {expiry > 0 && (
          <p className="mt-5 text-xs text-gray-400">
            Current access expires: {formatExpiry(expiry)}
          </p>
        )}
      </div>
    </div>
  );
}
