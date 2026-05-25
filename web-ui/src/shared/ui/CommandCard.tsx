import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib";
import type { ButtonTone } from "./Button";

type CommandCardProps = {
  action: {
    detail: string;
    id: string;
    label: string;
    tone?: ButtonTone;
  };
  icon?: ReactNode;
  onRun: () => void;
};

export function CommandCard({ action, icon = <ArrowUpRight size={16} strokeWidth={2.4} />, onRun }: CommandCardProps) {
  const tone = action.tone || "default";
  const toneClass = {
    danger: "border-red-400/20 hover:border-red-300/50 hover:bg-red-500/10",
    default: "border-zinc-800/90 hover:border-zinc-500/80 hover:bg-zinc-800/75",
    primary: "border-teal-300/20 hover:border-teal-200/55 hover:bg-teal-400/10",
  }[tone];

  return (
    <button
      className={cn(
        "group flex min-h-24 items-start justify-between gap-4 rounded-lg border bg-zinc-950/54 p-4 text-left shadow-sm shadow-black/20 transition outline-none focus-visible:ring-2 focus-visible:ring-teal-300/60",
        toneClass,
      )}
      type="button"
      onClick={onRun}
    >
      <span className="min-w-0">
        <strong className="block truncate text-sm font-bold text-zinc-50">{action.label}</strong>
        <small className="mt-1 block truncate text-xs text-zinc-400">{action.detail}</small>
      </span>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-zinc-700/70 text-zinc-300 transition group-hover:border-teal-300/50 group-hover:text-teal-200">
        {icon}
      </span>
    </button>
  );
}
