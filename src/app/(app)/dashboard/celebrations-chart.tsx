"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import type { Celebration } from "@/lib/celebrations";

// Matches the Badge tones used elsewhere for these same celebration types
// (brand / emerald-600 / amber-600).
const TYPE_COLOR: Record<Celebration["type"], string> = {
  birthday: "var(--color-brand)",
  anniversary: "#059669",
  work_anniversary: "#d97706",
};

const TYPE_LABEL: Record<Celebration["type"], string> = {
  birthday: "Birthday",
  anniversary: "Wedding Anniversary",
  work_anniversary: "Work Anniversary",
};

type ChartRow = {
  dateKey: string;
  day: string;
  birthday: number;
  anniversary: number;
  work_anniversary: number;
  names: Record<Celebration["type"], string[]>;
};

function CelebrationsTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartRow }[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  const entries = (Object.keys(TYPE_LABEL) as Celebration["type"][]).filter((t) => row.names[t].length > 0);
  if (entries.length === 0) return null;

  return (
    <div className="rounded-md border border-neutral-200 bg-white p-2 text-xs shadow-lg dark:bg-neutral-100">
      <p className="mb-1 font-medium text-neutral-900">{row.day}</p>
      {entries.map((t) => (
        <p key={t} className="text-neutral-600">
          <span style={{ color: TYPE_COLOR[t] }}>{TYPE_LABEL[t]}:</span> {row.names[t].join(", ")}
        </p>
      ))}
    </div>
  );
}

export function CelebrationsChart({ celebrations, windowLabel }: { celebrations: Celebration[]; windowLabel: string }) {
  if (celebrations.length === 0) {
    return (
      <Card className="mt-2 p-4">
        <p className="text-sm text-neutral-400">This section will populate once there&apos;s a celebration coming up.</p>
      </Card>
    );
  }

  const byDate = new Map<string, ChartRow>();
  for (const c of celebrations) {
    const dateKey = c.nextOccurrence.toISOString().slice(0, 10);
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, {
        dateKey,
        day: c.nextOccurrence.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        birthday: 0,
        anniversary: 0,
        work_anniversary: 0,
        names: { birthday: [], anniversary: [], work_anniversary: [] },
      });
    }
    const row = byDate.get(dateKey)!;
    row[c.type] += 1;
    row.names[c.type].push(c.memberName);
  }

  const chartData = Array.from(byDate.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  return (
    <Card className="mt-2 p-4">
      <p className="text-xs text-neutral-500">Next {windowLabel}</p>
      <div className="mt-2 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" />
            <XAxis dataKey="day" stroke="var(--color-neutral-500)" fontSize={12} />
            <YAxis stroke="var(--color-neutral-500)" fontSize={12} width={30} allowDecimals={false} />
            <Tooltip content={<CelebrationsTooltip />} />
            <Bar dataKey="birthday" stackId="a" fill={TYPE_COLOR.birthday} radius={[0, 0, 0, 0]} />
            <Bar dataKey="anniversary" stackId="a" fill={TYPE_COLOR.anniversary} radius={[0, 0, 0, 0]} />
            <Bar dataKey="work_anniversary" stackId="a" fill={TYPE_COLOR.work_anniversary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500">
        {(Object.keys(TYPE_LABEL) as Celebration["type"][]).map((t) => (
          <span key={t} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TYPE_COLOR[t] }} />
            {TYPE_LABEL[t]}
          </span>
        ))}
      </div>
    </Card>
  );
}
