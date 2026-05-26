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
      <span className="text-xs font-semibold uppercase text-zinc-500">{label}</span>
      <input
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-10 min-w-0 rounded-lg border bg-zinc-950/72 px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600",
          error
            ? "border-red-400/55 focus:border-red-300/80 focus:ring-2 focus:ring-red-300/20"
            : "border-zinc-700/80 focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/20",
        )}
        id={inputId}
        {...props}
      />
      {error ? (
        <span id={errorId} className="text-xs font-medium text-red-200">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="text-xs text-zinc-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
