import type { AppText } from "@/entities/infrastructure";
import { cn } from "@/shared/lib";

type SettingsSourceCardProps = {
  copy: AppText["settings"];
  exists: boolean;
  path: string;
};

export function SettingsSourceCard({ copy, exists, path }: SettingsSourceCardProps) {
  return (
    <section className="rounded-lg border border-zinc-800/90 bg-zinc-950/58 p-4 shadow-sm shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-zinc-500">{copy.sourceLabel}</p>
          <p className="mt-1 truncate text-sm font-semibold text-zinc-200">{path}</p>
        </div>
        <span
          className={cn(
            "rounded-md border px-2 py-1 text-xs font-bold",
            exists
              ? "border-emerald-300/35 bg-emerald-400/12 text-emerald-100"
              : "border-amber-300/35 bg-amber-400/12 text-amber-100",
          )}
        >
          {exists ? copy.sourceReady : copy.sourceMissing}
        </span>
      </div>
    </section>
  );
}
