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
import { Badge } from "@/components/ui/badge";
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

type ActivityBreakdown = {
  id: string;
  title: string;
  scheduledDate: string;
  present: number;
  absent: number;
  excused: number;
};

export function MonthlyChart({ rows }: { rows: MonthlyAttendanceRow[] }) {
  const [range, setRange] = useState<Range>(6);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [detail, setDetail] = useState<ActivityBreakdown[] | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const visible = rows.slice(-range);
  const average = computeMonthlyAttendanceRate(visible);

  const chartData = visible.map((row) => ({
    month: monthLabel(row.month_start),
    monthKey: row.month_start.slice(0, 7),
    rate:
      row.active_member_count * row.activity_count === 0
        ? 0
        : Math.round((row.present_count / (row.active_member_count * row.activity_count)) * 100),
  }));

  async function handleBarClick(data: { payload?: { monthKey?: string } }) {
    const monthKey = data?.payload?.monthKey;
    if (!monthKey) return;
    if (selectedMonth === monthKey) {
      setSelectedMonth(null);
      setDetail(null);
      return;
    }
    setSelectedMonth(monthKey);
    setDetail(null);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/activities/month-breakdown?month=${monthKey}`);
      const json = await res.json();
      setDetail(json.activities ?? []);
    } finally {
      setLoadingDetail(false);
    }
  }

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
        <>
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
                <Bar
                  dataKey="rate"
                  fill="var(--color-brand)"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={handleBarClick}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-center text-xs text-neutral-400">Click a bar to see that month&apos;s services</p>

          {selectedMonth && (
            <div className="mt-4 rounded-md border border-neutral-200 p-3">
              <p className="text-sm font-medium text-neutral-700">
                {new Date(`${selectedMonth}-01T00:00:00`).toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {loadingDetail && <p className="mt-2 text-sm text-neutral-400">Loading…</p>}
              {!loadingDetail && detail && detail.length === 0 && (
                <p className="mt-2 text-sm text-neutral-400">No closed services that month.</p>
              )}
              {!loadingDetail && detail && detail.length > 0 && (
                <ul className="mt-2 divide-y divide-neutral-100 text-sm">
                  {detail.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center gap-2 py-2">
                      <a href={`/activities/${a.id}`} className="font-medium text-neutral-900 hover:text-brand">
                        {a.title}
                      </a>
                      <span className="text-neutral-400">{a.scheduledDate}</span>
                      <Badge tone="brand">{a.present} present</Badge>
                      <Badge tone="danger">{a.absent} absent</Badge>
                      {a.excused > 0 && <Badge tone="warning">{a.excused} excused</Badge>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  );
}
