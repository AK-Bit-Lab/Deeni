/**
 * Date / time helpers shared across the Deeni frontend.
 *
 * Kept dependency-free so they can be imported from any component or
 * hook without pulling in a date library. All inputs are unix
 * timestamps in SECONDS (the unit used by Solidity's `block.timestamp`
 * and by every on-chain mapping in this project).
 */

/**
 * Format a unix timestamp (in seconds) as a short, locale-aware date
 * string suitable for display in the UI ("Mar 14, 2026").
 *
 * Returns null when the timestamp is missing/zero so callers can
 * render a placeholder instead of "Jan 1, 1970".
 *
 * @param {number|null|undefined} ts Unix timestamp in seconds.
 * @returns {string|null} Localized date string, or null if no timestamp.
 */
export function formatExpiry(ts) {
  if (!ts) return null;
  const d = new Date(ts * 1000);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Compute the number of whole days remaining until a unix timestamp
 * (in seconds). Returns 0 when the timestamp is missing/zero or has
 * already passed, so callers can safely use the result in conditional
 * UI ("3 days left" / "Expired") without further clamping.
 *
 * @param {number|null|undefined} ts Unix timestamp in seconds.
 * @returns {number} Whole days remaining (>= 0).
 */
export function daysLeft(ts) {
  if (!ts) return 0;
  const diff = ts * 1000 - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Format a unix timestamp (in seconds) as a locale-aware date+time
 * string suitable for activity feeds ("Mar 14, 2026, 3:42 PM").
 *
 * Returns null when the timestamp is missing/zero.
 *
 * @param {number|null|undefined} ts Unix timestamp in seconds.
 * @returns {string|null} Localized date+time string, or null if no timestamp.
 */
export function formatDateTime(ts) {
  if (!ts) return null;
  const d = new Date(ts * 1000);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
