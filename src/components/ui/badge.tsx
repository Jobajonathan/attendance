import type { HTMLAttributes } from "react";

export type BadgeTone = "neutral" | "success" | "warning" | "danger";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
};

export function Badge({
  tone = "neutral",
  className = "",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium capitalize ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
