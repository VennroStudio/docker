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
    danger: "border-red-200 hover:border-red-300 hover:bg-red-50",
    default: "border-sky-100 hover:border-sky-200 hover:bg-sky-50/55",
    primary: "border-teal-200 hover:border-teal-400 hover:bg-teal-50",
  }[tone];

  return (
    <button
      className={cn(
        "group flex min-h-24 items-start justify-between gap-4 rounded-lg border bg-white/82 p-4 text-left shadow-[0_12px_28px_rgba(14,165,233,0.10),0_5px_14px_rgba(168,85,247,0.06)] transition outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30",
        toneClass,
      )}
      type="button"
      onClick={onRun}
    >
      <span className="min-w-0">
        <strong className="block truncate text-sm font-bold text-slate-950">{action.label}</strong>
        <small className="mt-1 block truncate text-xs text-slate-500">{action.detail}</small>
      </span>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-sky-100 text-slate-500 shadow-[0_5px_12px_rgba(14,165,233,0.10)] transition group-hover:border-teal-300 group-hover:text-teal-700">
        {icon}
      </span>
    </button>
  );
}
