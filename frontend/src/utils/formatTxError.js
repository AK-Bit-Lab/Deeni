/**
 * formatTxError.js - turn raw wagmi/viem transaction errors into short,
 * user-friendly messages.
 *
 * Wallet and RPC errors are often long, technical strings (e.g. full
 * JSON-RPC payloads or Solidity revert traces). This maps the common
 * cases to plain language so components don't need to duplicate the
 * same regex checks.
 */

// Try to extract the Solidity revert reason from a viem/wagmi error
// message. viem typically embeds the reason after "reverted with the
// following reason:" or inside the `cause.shortMessage` field. Returns
// the trimmed reason string, or null if none could be found.
function extractRevertReason(msg) {
  if (!msg) return null;
  const m = msg.match(/reverted with the following reason:\s*"?([^"\n]+)"?/i);
  if (m && m[1]) return m[1].trim();
  const m2 = msg.match(/execution reverted(?::|\s)\s*"?([^"\n]+)"?/i);
  if (m2 && m2[1]) return m2[1].trim();
  return null;
}

export function formatTxError(error, fallback = "Transaction failed") {
  if (!error) return "";
  const msg = error.shortMessage || error.message || fallback;

  if (/user rejected|rejected request|denied/i.test(msg)) {
    return "Transaction rejected in wallet";
  }
  if (/reverted with the following reason/i.test(msg)) {
    const reason = extractRevertReason(msg);
    return reason
      ? `Transaction failed - ${reason}`
      : "Transaction failed - contract reverted";
  }
  if (/nonce too low/i.test(msg)) {
    return "Transaction failed - please try again";
  }
  if (/insufficient funds/i.test(msg)) {
    return "Insufficient CELO balance for this transaction";
  }
  if (/gas required exceeds allowance|out of gas/i.test(msg)) {
    return "Transaction failed - gas estimation failed. Try again";
  }
  if (/network error|failed to fetch|fetch failed/i.test(msg)) {
    return "Network error - check your connection and try again";
  }
  if (/chain mismatch|wrong network|unsupported chain/i.test(msg)) {
    return "Wrong network - switch to a supported network in your wallet";
  }

  return msg;
}
