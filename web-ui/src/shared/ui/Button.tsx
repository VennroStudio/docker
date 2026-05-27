import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib";

export type ButtonTone = "danger" | "default" | "primary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ButtonTone;
  icon?: ReactNode;
  loading?: boolean;
};

export function Button({
  className = "",
  disabled,
  icon,
  loading = false,
  tone = "default",
  children,
  ...props
}: ButtonProps) {
  const toneClass = {
    danger:
      "border-red-300 bg-red-50 text-red-700 shadow-[0_8px_18px_rgba(249,115,22,0.16)] hover:border-red-400 hover:bg-red-100 disabled:hover:bg-red-50",
    default:
      "border-sky-100 bg-white text-slate-700 shadow-[0_6px_14px_rgba(14,165,233,0.10)] hover:border-sky-200 hover:bg-sky-50/50 disabled:hover:bg-white",
    primary:
      "border-teal-400/70 bg-teal-50 text-teal-700 shadow-[0_8px_18px_rgba(20,184,166,0.18),0_4px_12px_rgba(168,85,247,0.08)] hover:border-teal-500 hover:bg-teal-100 disabled:hover:bg-teal-50",
  }[tone];

  return (
    <button
      className={cn(
        "inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-teal-300/60 disabled:cursor-not-allowed disabled:opacity-45",
        toneClass,
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading || icon ? (
        <span className="grid shrink-0 place-items-center">
          {loading ? <LoaderCircle className="animate-spin" size={17} strokeWidth={2.4} /> : icon}
        </span>
      ) : null}
      {children ? <span className="min-w-0 truncate">{children}</span> : null}
    </button>
  );
}
