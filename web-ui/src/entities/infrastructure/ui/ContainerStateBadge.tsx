import type { ContainerRuntimeState } from "../model/types";
import { cn } from "@/shared/lib";

type ContainerStateBadgeProps = {
  state: ContainerRuntimeState;
};

export function ContainerStateBadge({ state }: ContainerStateBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-1 text-xs font-bold uppercase shadow-[0_4px_10px_rgba(14,165,233,0.10)]",
        stateBadgeClass[state],
      )}
    >
      {state}
    </span>
  );
}

const stateBadgeClass: Record<ContainerRuntimeState, string> = {
  created: "border-amber-200 bg-amber-50 text-amber-700",
  dead: "border-red-200 bg-red-50 text-red-700",
  exited: "border-amber-200 bg-amber-50 text-amber-700",
  missing: "border-slate-200 bg-slate-50 text-slate-500",
  paused: "border-amber-200 bg-amber-50 text-amber-700",
  removing: "border-red-200 bg-red-50 text-red-700",
  restarting: "border-red-200 bg-red-50 text-red-700",
  running: "border-emerald-200 bg-emerald-50 text-emerald-700",
  stopped: "border-amber-200 bg-amber-50 text-amber-700",
  unknown: "border-slate-200 bg-slate-50 text-slate-500",
};
