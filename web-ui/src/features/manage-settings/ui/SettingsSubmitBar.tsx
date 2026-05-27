import { RotateCcw, Save } from "lucide-react";
import type { AppText } from "@/entities/infrastructure";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui";

type SettingsSubmitBarProps = {
  copy: AppText["settings"];
  dirty: boolean;
  saved: boolean;
  saving?: boolean;
  onReset: () => void;
};

export function SettingsSubmitBar({ copy, dirty, onReset, saved, saving }: SettingsSubmitBarProps) {
  return (
    <section className="sticky bottom-4 z-10 rounded-lg border border-zinc-800/90 bg-zinc-950/90 p-3 shadow-xl shadow-black/30 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={cn("text-sm font-medium", saved ? "text-emerald-200" : "text-zinc-500")}>
          {saved ? copy.saved : dirty ? copy.unsaved : copy.clean}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={!dirty || saving}
            icon={<RotateCcw size={17} strokeWidth={2.4} />}
            type="button"
            onClick={onReset}
          >
            {copy.reset}
          </Button>
          <Button
            disabled={!dirty || saving}
            icon={<Save size={17} strokeWidth={2.4} />}
            loading={saving}
            tone="primary"
            type="submit"
          >
            {copy.save}
          </Button>
        </div>
      </div>
    </section>
  );
}
