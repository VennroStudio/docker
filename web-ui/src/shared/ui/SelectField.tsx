import type { SelectHTMLAttributes } from "react";
import { cn } from "@/shared/lib";

type SelectFieldOption = {
  label: string;
  value: string;
};

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectFieldOption[];
};

export function SelectField({ className, label, options, ...props }: SelectFieldProps) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select
        className={cn(
          "h-10 min-w-0 rounded-lg border border-sky-100 bg-white px-3 text-sm text-slate-950 shadow-[0_5px_14px_rgba(15,23,42,0.08)] outline-none transition focus:border-teal-500/70 focus:ring-2 focus:ring-teal-100",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
