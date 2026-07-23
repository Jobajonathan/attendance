// This deployment is single-timezone: Light Nation Abuja operates in West
// Africa Time (WAT, UTC+1, no DST). <input type="datetime-local"> values carry
// no timezone info, and server actions run on Vercel (UTC) — without this
// conversion, an admin typing "2:26 PM" intending Lagos/Abuja time gets it
// stored as 2:26 PM UTC (3:26 PM WAT), an hour later than intended.
const WAT_OFFSET = "+01:00";

/** "YYYY-MM-DDTHH:MM" (datetime-local, implicitly WAT) -> UTC ISO string. */
export function datetimeLocalToUtcIso(value: string): string {
  return new Date(`${value}:00${WAT_OFFSET}`).toISOString();
}

/** UTC ISO string -> "YYYY-MM-DDTHH:MM" in WAT, for pre-filling a datetime-local input. */
export function utcIsoToDatetimeLocal(iso: string): string {
  const watMs = new Date(iso).getTime() + 60 * 60 * 1000;
  return new Date(watMs).toISOString().slice(0, 16);
}

/** Today's date in WAT, normalized to local midnight (for date-only comparisons). */
export function todayInWat(): Date {
  const nowWat = new Date(Date.now() + 60 * 60 * 1000);
  return new Date(Date.UTC(nowWat.getUTCFullYear(), nowWat.getUTCMonth(), nowWat.getUTCDate()));
}

/** "YYYY-MM-DD" for a Date already normalized via todayInWat(). */
export function dateToWatDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Adds `days` calendar days to a WAT-normalized Date (see todayInWat()). */
export function addDaysWat(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}
