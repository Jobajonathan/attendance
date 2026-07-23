// The department's historical sign-up form captured date of birth without a
// year (e.g. "9/13"), and `members.birthday` is a Postgres `date`, which
// requires one. Month/day-only birthdays are stored under this sentinel year
// so every future query stays a plain `date` comparison — never use this
// column to compute age, only `extract(month from birthday)` /
// `extract(day from birthday)` are safe.
export const BIRTHDAY_SENTINEL_YEAR = 2000; // leap year, so Feb 29 survives

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_DAY = /^(\d{1,2})\/(\d{1,2})$/;

/** Accepts "YYYY-MM-DD" (passthrough) or "M/D" / "MM/DD" (→ sentinel-year date). */
export function parseBirthdayInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (ISO_DATE.test(trimmed)) return trimmed;

  const match = trimmed.match(MONTH_DAY);
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  return `${BIRTHDAY_SENTINEL_YEAR}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
