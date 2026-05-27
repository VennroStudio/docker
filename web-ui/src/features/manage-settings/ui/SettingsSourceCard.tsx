import type { AppText } from "@/entities/infrastructure";
import { cn } from "@/shared/lib";

type SettingsSourceCardProps = {
  copy: AppText["settings"];
  exists: boolean;
  path: string;
};

export function SettingsSourceCard({ copy, exists, path }: SettingsSourceCardProps) {
  return (
    <section className="rounded-lg border border-sky-100/90 bg-white/76 p-4 shadow-[0_14px_34px_rgba(14,165,233,0.12),0_6px_18px_rgba(168,85,247,0.07)] ring-1 ring-fuchsia-100/45 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-slate-500">{copy.sourceLabel}</p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-800">{path}</p>
        </div>
        <span
          className={cn(
            "rounded-md border px-2 py-1 text-xs font-bold",
            exists
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-[0_5px_14px_rgba(34,197,94,0.14)]"
              : "border-amber-300 bg-amber-50 text-amber-700 shadow-[0_5px_14px_rgba(249,115,22,0.14)]",
          )}
        >
          {exists ? copy.sourceReady : copy.sourceMissing}
        </span>
      </div>
    </section>
  );
}
