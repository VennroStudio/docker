import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Field({ className, label, ...props }: FieldProps) {
  return (
    <label className={cn("grid gap-2 text-sm", className)}>
      <span className="text-xs font-semibold uppercase text-zinc-500">{label}</span>
      <input
        className="h-10 min-w-0 rounded-lg border border-zinc-700/80 bg-zinc-950/72 px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/20"
        {...props}
      />
    </label>
  );
}
