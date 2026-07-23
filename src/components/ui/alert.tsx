import type { HTMLAttributes } from "react";

export type AlertTone = "error" | "success" | "info";

const toneClasses: Record<AlertTone, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-slate-200 bg-slate-50 text-slate-700",
};

export function Alert({
  tone = "info",
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { tone?: AlertTone }) {
  return (
    <p
      role={tone === "error" ? "alert" : undefined}
      className={`rounded-md border px-3 py-2 text-sm ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
