import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { useSubscription } from "../hooks/useSubscription";
import { isMiniPay, DEENI_SUBSCRIPTION_ADDRESS } from "../constants";
import { formatTxError } from "../utils/formatTxError";
import { formatExpiry, daysLeft } from "../utils/date";

// Paywall copy. Centralised so the strings can be tweaked (or later
// translated) without hunting through the JSX below.
const COPY = {
  welcomeTitle: "{COPY.welcomeTitle}",
  welcomeBody:
    "Your fully on-chain Islamic companion - learn Arabic, find Qibla, calculate Zakat and more.",
  miniPayHint: "{COPY.miniPayHint}",
  connectCta: "Connect Wallet",
  connectHint:
    "{COPY.connectHint}",
  noWalletBody:
    "No wallet detected. Install a Celo-compatible wallet extension to continue.",
  installCta: "{COPY.installCta}",
  installHint: "{COPY.installHint}",
  devBanner: "{COPY.devBanner}",
  loading: "{COPY.loading}",
  paywallTitle: "{COPY.paywallTitle}",
  paywallBody:
    "Get full access to Arabic learning, Qibla compass, Zakat calculator, Hijri calendar and the 99 Names of Allah - fully on-chain.",
  trialCta: "Start 1-Month Free Trial",
  payCta: "Pay 5 CELO (30 Days)",
  processing: "Processing…",
  connecting: "Connecting…",
  confirmed: "{COPY.confirmed}",
  expiresPrefix: "Current access expires: ",
  daysLeftSuffix: "d left",
};

/**
 * SubscriptionGuard
 * Wraps the app and gates access behind the on-chain subscription state.
 *
 * Behaviour:
 * - When no wallet is connected, shows a "connect wallet" paywall.
 * - When a wallet is connected but the user is not subscribed, shows a
 *   paywall with two CTAs: start the free trial (if available) or pay
 *   the 5 CELO subscription fee.
 * - When the user is subscribed, renders `children` directly.
 * - When the contract address is still the all-zero placeholder
 *   (development mode), access is granted unconditionally so the UI
 *   can be built and tested before deployment.
 *
 * Props:
 *   children - the protected subtree to render when access is granted.
 */
export default function SubscriptionGuard({ children }) {
  const { isConnected } = useAccount();
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

  useEffect(() => {
    if (!isConnected) return;
    if (CONTRACT_ZERO) return; // dev mode: open access
    if (!subLoading && !isSubscribed) setShowPaywall(true);
    else setShowPaywall(false);
  }, [isConnected, isSubscribed, subLoading, CONTRACT_ZERO]);

  // When the on-chain transaction is confirmed, the useSubscription hook
  // invalidates the subscription reads so TanStack Query refetches and the
  // paywall closes automatically. No page reload is needed.
  useEffect(() => {
    if (!isConfirmed) return;
  }, [isConfirmed]);

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
          {COPY.welcomeTitle}
        </h1>
        <p className="text-gray-600 mb-6 max-w-xs">
          {COPY.welcomeBody}
        </p>

        {isMiniPay() ? (
          <p className="text-sm text-emerald-600 mt-4">
            {COPY.miniPayHint}
          </p>
        ) : hasInjected ? (
          <div className="w-full max-w-xs">
            <button
              type="button"
              onClick={() => connect({ connector: connectors[0] })}
              disabled={isConnecting}
              aria-label="Connect a Celo-compatible wallet"
              className="w-full py-3.5 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              {isConnecting ? COPY.connecting : COPY.connectCta}
            </button>
            <p className="text-xs text-gray-400 mt-3">
              {COPY.connectHint}
            </p>
            {connectError && (
              <p role="alert" className="text-xs text-red-600 mt-2">
                {formatTxError(connectError, "Could not connect wallet")}
              </p>
            )}
          </div>
        ) : (
          <div className="w-full max-w-xs">
            <p className="text-sm text-gray-500 mb-4">
              {COPY.noWalletBody}
            </p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block py-3 px-5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
            >
              {COPY.installCta}
            </a>
            <p className="text-xs text-gray-400 mt-4">
              {COPY.installHint}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Dev mode (contract not deployed yet) - open access
  if (CONTRACT_ZERO) {
    return (
      <>
        {children}
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-800 text-xs px-3 py-1.5 rounded-full shadow z-40">
          {COPY.devBanner}
        </div>
      </>
    );
  }

  if (subLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">{COPY.loading}</p>
      </div>
    );
  }

  // Subscribed - show app + status badge
  if (isSubscribed && !showPaywall) {
    return (
      <>
        {children}
        {expiry > 0 && (
          <div className="fixed top-3 right-3 bg-emerald-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow z-40">
            {daysLeft(expiry)}{COPY.daysLeftSuffix}
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
          {COPY.paywallTitle}
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          {COPY.paywallBody}
        </p>

        {error && (
          <div role="alert" className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
            {formatTxError(error)}
          </div>
        )}

        {isConfirmed && (
          <div role="status" aria-live="polite" className="mb-4 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-xl">
            {COPY.confirmed}
          </div>
        )}

        <div className="space-y-4">
          {!trialClaimed && (
            <button
              type="button"
              onClick={startTrial}
              disabled={isPending || isConfirming}
              aria-label="Start a one-month free trial of Deeni"
              className="w-full py-3.5 px-4 bg-emerald-100 text-emerald-800 font-semibold rounded-xl hover:bg-emerald-200 transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              {isPending || isConfirming ? COPY.processing : COPY.trialCta}
            </button>
          )}

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-200" />
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <button
            type="button"
            onClick={paySubscription}
            disabled={isPending || isConfirming}
            aria-label="Pay 5 CELO for 30 days of Deeni access"
            className="w-full py-3.5 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {isPending || isConfirming ? COPY.processing : COPY.payCta}
          </button>
        </div>

        {expiry > 0 && (
          <p className="mt-5 text-xs text-gray-400">
            {COPY.expiresPrefix}{formatExpiry(expiry)}
          </p>
        )}
      </div>
    </div>
  );
}
