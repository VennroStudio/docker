import type { InputHTMLAttributes } from "react";
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  const passwordField = props.type === "password";
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputType = passwordField && passwordVisible ? "text" : props.type;

  return (
    <div className={cn("grid gap-2 text-sm", className)}>
      <label className="text-xs font-semibold uppercase text-slate-500" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative min-w-0">
        <input
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-10 w-full min-w-0 rounded-lg border bg-white px-3 text-sm text-slate-950 shadow-[0_5px_14px_rgba(15,23,42,0.08)] outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60",
            passwordField ? "pr-10" : "",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-orange-100"
              : "border-sky-100 focus:border-teal-500/70 focus:ring-2 focus:ring-teal-100",
          )}
          id={inputId}
          {...props}
          type={inputType}
        />
        {passwordField ? (
          <button
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-slate-500 transition hover:bg-sky-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={props.disabled}
            type="button"
            onClick={() => setPasswordVisible((value) => !value)}
          >
            {passwordVisible ? <EyeOff size={16} strokeWidth={2.4} /> : <Eye size={16} strokeWidth={2.4} />}
          </button>
        ) : null}
      </div>
      {error ? (
        <span id={errorId} className="text-xs font-medium text-red-600">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="text-xs text-slate-500">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
