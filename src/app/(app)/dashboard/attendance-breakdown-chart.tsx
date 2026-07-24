"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";

export type AttendanceBreakdownRow = {
  id: string;
  title: string;
  scheduledDate: string;
  present: number;
  absent: number;
  excused: number;
};

function dayLabel(scheduledDate: string) {
  return new Date(`${scheduledDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
  });
}

export function AttendanceBreakdownChart({ rows, monthLabel }: { rows: AttendanceBreakdownRow[]; monthLabel: string }) {
  if (rows.length === 0) {
    return (
      <Card className="mt-2 p-4">
        <p className="text-sm text-neutral-400">
          This section will populate once there&apos;s attendance data for {monthLabel}.
        </p>
      </Card>
    );
  }

  const chartData = rows.map((r) => ({
    day: dayLabel(r.scheduledDate),
    title: r.title,
    present: r.present,
  }));

  return (
    <Card className="mt-2 p-4">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" />
            <XAxis dataKey="day" stroke="var(--color-neutral-500)" fontSize={12} />
            <YAxis stroke="var(--color-neutral-500)" fontSize={12} width={40} allowDecimals={false} />
            <Tooltip
              formatter={(value) => [value, "Present"]}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.title ?? label}
            />
            <Bar dataKey="present" fill="var(--color-brand)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
