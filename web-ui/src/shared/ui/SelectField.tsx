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
      <span className="text-xs font-semibold uppercase text-zinc-500">{label}</span>
      <select
        className={cn(
          "h-10 min-w-0 rounded-lg border border-zinc-700/80 bg-zinc-950/72 px-3 text-sm text-zinc-100 outline-none transition focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/20",
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
