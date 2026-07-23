import type { Tables } from "@/lib/supabase/database.types";

export type CelebrationType = "birthday" | "anniversary";

export type Celebration = {
  memberId: string;
  memberName: string;
  type: CelebrationType;
  date: string;
  nextOccurrence: Date;
  isToday: boolean;
};

type MonthDay = { month: number; day: number };

// Splits the "YYYY-MM-DD" string directly rather than `new Date(str)`, so a
// birthday sentinel year (2000, for members whose real birth year is unknown)
// is never read at all — only month/day feed the celebration logic below.
function parseMonthDay(value: string): MonthDay | null {
  const match = /^\d{4}-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return { month: Number(match[1]), day: Number(match[2]) };
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// Feb 29 in a non-leap target year observes on Feb 28 (arbitrary tie-break).
function dateFor(year: number, { month, day }: MonthDay): Date {
  if (month === 2 && day === 29 && !isLeapYear(year)) {
    return new Date(year, 1, 28);
  }
  return new Date(year, month - 1, day);
}

function nextOccurrence(monthDay: MonthDay, todayMidnight: Date): Date {
  const candidate = dateFor(todayMidnight.getFullYear(), monthDay);
  if (candidate < todayMidnight) {
    return dateFor(todayMidnight.getFullYear() + 1, monthDay);
  }
  return candidate;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

type CelebrationMember = Pick<Tables<"members">, "id" | "name" | "birthday" | "anniversary_date" | "status_manual">;

// FR-CEL-01/02: today's + upcoming celebrations for the Leadership Dashboard.
// Excludes only relocated members — suspended/out_of_town/other still show,
// since a birthday is a low-cost, potentially re-engaging touchpoint, not a
// status-gated feature.
export function buildCelebrations(
  members: CelebrationMember[],
  today: Date,
  lookAheadDays = 7,
): Celebration[] {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const celebrations: Celebration[] = [];

  for (const member of members) {
    if (member.status_manual === "relocated") continue;

    const candidates: [CelebrationType, string | null][] = [
      ["birthday", member.birthday],
      ["anniversary", member.anniversary_date],
    ];

    for (const [type, value] of candidates) {
      if (!value) continue;
      const monthDay = parseMonthDay(value);
      if (!monthDay) continue;

      const next = nextOccurrence(monthDay, todayMidnight);
      const diff = daysBetween(todayMidnight, next);
      if (diff > lookAheadDays) continue;

      celebrations.push({
        memberId: member.id,
        memberName: member.name,
        type,
        date: value,
        nextOccurrence: next,
        isToday: diff === 0,
      });
    }
  }

  return celebrations.sort((a, b) => a.nextOccurrence.getTime() - b.nextOccurrence.getTime());
}
