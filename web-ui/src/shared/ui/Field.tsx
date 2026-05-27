import type { InputHTMLAttributes } from "react";
import { useId } from "react";
import { cn } from "@/shared/lib";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  hint?: string;
  label: string;
};

export function Field({ className, error, hint, label, ...props }: FieldProps) {
  const generatedId = useId();
  const inputId = props.id || generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <label className={cn("grid gap-2 text-sm", className)}>
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-10 min-w-0 rounded-lg border bg-white px-3 text-sm text-slate-950 shadow-[0_5px_14px_rgba(15,23,42,0.08)] outline-none transition placeholder:text-slate-400",
          error
            ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-orange-100"
            : "border-sky-100 focus:border-teal-500/70 focus:ring-2 focus:ring-teal-100",
        )}
        id={inputId}
        {...props}
      />
      {error ? (
        <span id={errorId} className="text-xs font-medium text-red-600">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="text-xs text-slate-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
