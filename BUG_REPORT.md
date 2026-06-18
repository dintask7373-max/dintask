# Bug Report — Time / Timezone & Related Issues

**Date:** 2026-06-18
**Scope:** Date/time handling across frontend greetings and backend cron / notification code.
**Theme:** The app targets Indian users but almost all date/time logic relied on *device-local* (frontend) or *server-local* (backend) time instead of explicitly using **IST (`Asia/Kolkata`)**. On a cloud server (usually UTC), this meant times were shown/triggered **5h30m off**.

**Status: All items below are now FIXED ✅.** A shared helper `Backend/src/utils/dateIST.js` (`formatIST`, `istStartOfDay`, `addDays`) was added and all backend timestamps / day-boundary math route through it. Syntax-checked and the IST helpers were verified with sample instants. No existing feature behavior was changed other than correcting the timezone.

---

## 1. Greeting always says "Good Morning" — FIXED ✅
**File:** `Frontend/src/modules/user/pages/TaskHome.jsx:83`
**Severity:** Medium (user-visible)

The greeting was hardcoded `"Good Morning, …"` regardless of the time of day. No time logic existed at all.

**Fix applied:** Added a `greeting` value computed from the current hour in `Asia/Kolkata` via `Intl.DateTimeFormat`, returning Morning / Afternoon / Evening / Night. Works correctly even if the device clock is set to a non-Indian timezone.

---

## 2. Notification timestamps shown in server timezone, not IST — OPEN 🔴
**Files:**
- `Backend/src/utils/reminderCron.js:100` — reminder message: `…scheduled for ${new Date(...).toLocaleString()}`
- `Backend/src/controllers/followUpController.js:117` — `…on ${new Date(scheduledAt).toLocaleString()}`
- `Backend/src/utils/reminderCron.js:19` — heartbeat log

**Severity:** High (wrong info shown to users) — **FIXED ✅**

`Date.prototype.toLocaleString()` with no arguments formats using the **server's** locale and timezone. On a UTC-hosted backend, a follow-up scheduled for **3:00 PM IST** was shown to the sales rep as **9:30 AM**. Every reminder/follow-up notification timestamp was wrong by the server's UTC offset.

**Fix applied:** All three spots now use `formatIST(date)` from `utils/dateIST.js`, which formats with `{ timeZone: 'Asia/Kolkata' }`.

---

## 3. Cron jobs run on server timezone, not IST — OPEN 🔴
**Files:**
- `Backend/src/utils/subscriptionCron.js:229` — `cron.schedule('0 0 * * *', …)`
- `Backend/src/utils/reminderCron.js:129` — `cron.schedule('* * * * *', …)`

**Severity:** High (subscription cron), Low (reminder cron) — **FIXED ✅**

Neither `cron.schedule` call passed a `timezone` option, so they fired on the **server's** clock. The daily subscription check intended for "midnight" ran at **midnight UTC = 5:30 AM IST**.

**Fix applied:** Both `cron.schedule(...)` calls now pass `{ timezone: 'Asia/Kolkata' }` (verified node-cron v4.2.1 accepts it).

---

## 4. Subscription expiry "day" buckets computed in server-local time — OPEN 🔴
**File:** `Backend/src/utils/subscriptionCron.js:13-20, 131-132, 165-171`
**Severity:** High — **FIXED ✅**

`today.setHours(0,0,0,0)` and the derived `+1/+2/+3 day` windows used the **server-local** day boundary. On a UTC server, the "today / tomorrow / in N days" windows aligned to UTC midnight, not IST midnight. A subscription expiring at e.g. `2026-06-18 23:00 IST` (= `17:30 UTC`) could be bucketed into the wrong calendar day, so the "expiring tomorrow" email / auto-expire could fire a day early or late.

**Fix applied:** Day boundaries now come from `istStartOfDay()` and `addDays()`, which anchor to IST midnight as an absolute instant. Verified: `2026-06-18 23:00 IST → istStartOfDay = 2026-06-17T18:30:00Z` (= Jun 18 00:00 IST).

---

## 5. Same-day reminder boundary uses server-local midnight — OPEN 🟠
**File:** `Backend/src/utils/reminderCron.js:55-59`
**Severity:** Medium — **FIXED ✅**

`today.setHours(0,0,0,0)` / `deadlineDay.setHours(0,0,0,0)` computed `daysDiff` against the server-local day. The day-based stages (`2_days`, `1_day`, `same_day`) therefore flipped over at the wrong moment for IST users (UTC midnight = 5:30 AM IST). The minute-based stages (`1_hour`, `5_mins`) were already correct (absolute time differences).

**Fix applied:** `daysDiff` now uses `istStartOfDay(now)` and `istStartOfDay(deadline)`.

---

## 6. Subscription cron completion log undercounts — OPEN 🟢
**File:** `Backend/src/utils/subscriptionCron.js:221`
**Severity:** Low (logging only) — **FIXED ✅**

The completion log omitted `expiringIn2Days.length` (the 2-day batch added later), so the logged count was wrong. No functional impact.

**Fix applied:** `expiringIn2Days.length` is now included in the total.

---

## 7. Home screen date subtitle uses device-local time — OPEN 🟢
**File:** `Frontend/src/modules/user/pages/TaskHome.jsx:86`
**Severity:** Low — **FIXED ✅**

`format(new Date(), 'EEEE, MMM dd')` used the device's local timezone, so the displayed weekday/date could be off by a day near midnight for a non-IST device.

**Fix applied:** Replaced with `Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', weekday: 'long', month: 'short', day: '2-digit' })`. The now-unused `format` import from `date-fns` was removed.

---

## 8. Recurring task drops subtask `userModel` — FIXED ✅
**File:** `Backend/src/controllers/taskController.js` (recurrence logic, ~line 453)
**Severity:** Low–Medium (found during this pass)

When a completed recurring task spawned its next instance, the subtask copy mapped only `{ user, status, progress }` and dropped `userModel`. The schema then defaulted `userModel` to `'Employee'`, so a subtask originally assigned to a **Manager** got mis-typed — breaking `refPath` population for that subtask in the generated task.

**Fix applied:** The copy now preserves `userModel: st.userModel`.

---

## Verification
- `node --check` passed on all changed backend files.
- `dateIST.js` helpers verified against sample instants (IST midnight + day math).
- `node-cron` v4.2.1 confirmed to accept the `{ timezone }` option.
- No existing logic/behavior changed beyond correcting timezone handling and the subtask field.
