"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { computeEngagement, type WeeklyEngagementRow } from "@/lib/engagement";

export function EngagementTrend({ rows }: { rows: WeeklyEngagementRow[] }) {
  const [range, setRange] = useState<4 | 12>(4);
  const visible = rows.slice(-range);

  return (
    <Card className="mt-2 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-700">Weekly engagement</p>
        <div className="flex gap-1">
          <Button size="sm" variant={range === 4 ? "primary" : "secondary"} onClick={() => setRange(4)}>
            4 weeks
          </Button>
          <Button size="sm" variant={range === 12 ? "primary" : "secondary"} onClick={() => setRange(12)}>
            12 weeks
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-400">No closed activities in this window yet.</p>
      ) : (
        <div className="mt-4 flex items-end gap-2">
          {visible.map((row) => {
            const value = computeEngagement([row]);
            const pct = value === null ? 0 : Math.round(value * 100);
            return (
              <div key={row.week_start} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-24 w-full items-end">
                  <div
                    className="w-full rounded-t bg-brand"
                    style={{ height: value === null ? "2px" : `${Math.max(pct, 4)}%` }}
                    title={value === null ? "No data" : `${pct}%`}
                  />
                </div>
                <span className="text-[10px] text-neutral-500">
                  {new Date(`${row.week_start}T00:00:00`).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
