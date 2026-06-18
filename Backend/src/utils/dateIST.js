// Centralized Indian Standard Time (IST, UTC+5:30, no DST) helpers.
// The app targets Indian users, but servers usually run in UTC. These helpers
// keep all user-facing timestamps and day-boundary math anchored to IST so they
// don't drift by the server's UTC offset.

const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000; // +5:30
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Format a date/instant as an IST string for display in notifications, emails, logs.
 * @param {Date|string|number} date
 * @param {Intl.DateTimeFormatOptions} [opts]
 * @returns {string}
 */
function formatIST(date, opts = {}) {
  return new Date(date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', ...opts });
}

/**
 * Returns the absolute instant (UTC Date) corresponding to IST midnight
 * (00:00:00) of the IST calendar day that `date` falls on.
 * Comparisons against stored UTC Dates work because the returned value is a real instant.
 * @param {Date|string|number} [date]
 * @returns {Date}
 */
function istStartOfDay(date = new Date()) {
  const istWallClockMs = new Date(date).getTime() + IST_OFFSET_MS;
  const istMidnightWallClockMs = Math.floor(istWallClockMs / DAY_MS) * DAY_MS;
  return new Date(istMidnightWallClockMs - IST_OFFSET_MS);
}

/**
 * Add N whole days to an instant (uses fixed 24h; safe for IST which has no DST).
 * @param {Date|string|number} date
 * @param {number} days
 * @returns {Date}
 */
function addDays(date, days) {
  return new Date(new Date(date).getTime() + days * DAY_MS);
}

module.exports = { formatIST, istStartOfDay, addDays, IST_OFFSET_MS, DAY_MS };
