import type { InputHTMLAttributes } from "react";

export function Field({
  label,
  name,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:bg-slate-100"
        {...props}
      />
    </div>
  );
}
