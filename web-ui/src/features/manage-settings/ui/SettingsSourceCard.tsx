import { FileText } from "lucide-react";
import type { AppText } from "@/entities/infrastructure";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui";

type SettingsSourceCardProps = {
  copy: AppText["settings"];
  envGenerated?: boolean;
  exists: boolean;
  generateDisabled?: boolean;
  generatingEnv?: boolean;
  path: string;
  onGenerateEnv: () => void;
};

export function SettingsSourceCard({
  copy,
  envGenerated = false,
  exists,
  generateDisabled = false,
  generatingEnv = false,
  onGenerateEnv,
  path,
}: SettingsSourceCardProps) {
  return (
    <section className="rounded-lg border border-sky-100/90 bg-white/76 p-4 shadow-[0_14px_34px_rgba(14,165,233,0.12),0_6px_18px_rgba(168,85,247,0.07)] ring-1 ring-fuchsia-100/45 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-slate-500">{copy.sourceLabel}</p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-800">{path}</p>
          {envGenerated ? <p className="mt-1 text-xs font-semibold text-emerald-700">{copy.envGenerated}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled={generateDisabled}
            icon={<FileText size={17} strokeWidth={2.4} />}
            loading={generatingEnv}
            tone="primary"
            title={generateDisabled ? copy.unsaved : undefined}
            type="button"
            onClick={onGenerateEnv}
          >
            {copy.generateEnv}
          </Button>
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
      </div>
    </section>
  );
}
