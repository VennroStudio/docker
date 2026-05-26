import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib";

export type ButtonTone = "danger" | "default" | "primary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ButtonTone;
  icon?: ReactNode;
};

export function Button({ className = "", icon, tone = "default", children, ...props }: ButtonProps) {
  const toneClass = {
    danger:
      "border-red-400/35 bg-red-500/12 text-red-50 hover:border-red-300/60 hover:bg-red-500/20 disabled:hover:bg-red-500/12",
    default:
      "border-zinc-700/80 bg-zinc-900/82 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800 disabled:hover:bg-zinc-900/82",
    primary:
      "border-teal-300/40 bg-teal-400/14 text-teal-50 hover:border-teal-200/70 hover:bg-teal-400/22 disabled:hover:bg-teal-400/14",
  }[tone];

  return (
    <button
      className={cn(
        "inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-teal-300/60 disabled:cursor-not-allowed disabled:opacity-45",
        toneClass,
        className,
      )}
      {...props}
    >
      {icon ? <span className="grid shrink-0 place-items-center">{icon}</span> : null}
      <span className="min-w-0 truncate">{children}</span>
    </button>
  );
}
