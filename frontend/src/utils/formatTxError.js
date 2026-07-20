/**
 * formatTxError.js — turn raw wagmi/viem transaction errors into short,
 * user-friendly messages.
 *
 * Wallet and RPC errors are often long, technical strings (e.g. full
 * JSON-RPC payloads or Solidity revert traces). This maps the common
 * cases to plain language so components don't need to duplicate the
 * same regex checks.
 */
export function formatTxError(error, fallback = "Transaction failed") {
  if (!error) return "";
  const msg = error.shortMessage || error.message || fallback;

  if (/user rejected|rejected request|denied/i.test(msg)) {
    return "Transaction rejected in wallet";
  }
  if (/reverted with the following reason/i.test(msg)) {
    return "Transaction failed — contract reverted";
  }
  if (/nonce too low/i.test(msg)) {
    return "Transaction failed — please try again";
  }
  if (/insufficient funds/i.test(msg)) {
    return "Insufficient CELO balance for this transaction";
  }

  return msg;
}
