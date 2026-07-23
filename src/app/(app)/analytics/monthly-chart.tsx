"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { computeMonthlyAttendanceRate, type MonthlyAttendanceRow } from "@/lib/engagement";

type Range = 1 | 6 | 12;

const RANGE_LABELS: Record<Range, string> = {
  1: "This Month",
  6: "6 Months",
  12: "Year",
};

function monthLabel(monthStart: string) {
  return new Date(`${monthStart}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
  });
}

export function MonthlyChart({ rows }: { rows: MonthlyAttendanceRow[] }) {
  const [range, setRange] = useState<Range>(6);
  const visible = rows.slice(-range);
  const average = computeMonthlyAttendanceRate(visible);

  const chartData = visible.map((row) => ({
    month: monthLabel(row.month_start),
    rate:
      row.active_member_count * row.activity_count === 0
        ? 0
        : Math.round((row.present_count / (row.active_member_count * row.activity_count)) * 100),
  }));

  return (
    <Card className="mt-2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-neutral-700">Monthly attendance rate</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">
            {average === null ? "—" : `${Math.round(average * 100)}%`}{" "}
            <span className="text-sm font-normal text-neutral-500">average for {RANGE_LABELS[range].toLowerCase()}</span>
          </p>
        </div>
        <div className="flex gap-1">
          {([1, 6, 12] as Range[]).map((r) => (
            <Button key={r} size="sm" variant={range === r ? "primary" : "secondary"} onClick={() => setRange(r)}>
              {RANGE_LABELS[r]}
            </Button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-400">No closed attendance activities in this window yet.</p>
      ) : (
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" />
              <XAxis dataKey="month" stroke="var(--color-neutral-500)" fontSize={12} />
              <YAxis stroke="var(--color-neutral-500)" fontSize={12} unit="%" width={40} />
              <Tooltip formatter={(value) => [`${value}%`, "Attendance rate"]} />
              {average !== null && (
                <ReferenceLine
                  y={Math.round(average * 100)}
                  stroke="var(--color-brand)"
                  strokeDasharray="4 4"
                  label={{ value: "Average", position: "insideTopRight", fontSize: 11, fill: "var(--color-brand)" }}
                />
              )}
              <Bar dataKey="rate" fill="var(--color-brand)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
