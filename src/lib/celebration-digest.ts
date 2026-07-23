import { buildCelebrations, type Celebration } from "@/lib/celebrations";

export type MonthlyDigestEmail = {
  subject: string;
  body: string;
};

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// FR-CEL: "at the beginning of every month, email the admin the birthdays we
// will be having during the month." Scoped to birthdays only, per the
// request — this doesn't send anything (no email integration is authorized
// in this environment); it builds the content an eventual send would use.
export function buildMonthlyDigestEmail(
  members: Parameters<typeof buildCelebrations>[0],
  today: Date,
): MonthlyDigestEmail {
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const lookAheadDays = daysInMonth(today.getFullYear(), today.getMonth());
  const birthdays = buildCelebrations(members, monthStart, lookAheadDays).filter(
    (c): c is Celebration => c.type === "birthday",
  );

  const monthName = today.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const subject = `Birthdays this month — ${monthName}`;

  const lines = birthdays.map(
    (c) => `- ${c.memberName}: ${c.nextOccurrence.toLocaleDateString(undefined, { month: "long", day: "numeric" })}`,
  );
  const body =
    birthdays.length === 0
      ? `No birthdays this month.`
      : `Birthdays in ${monthName}:\n\n${lines.join("\n")}`;

  return { subject, body };
}
