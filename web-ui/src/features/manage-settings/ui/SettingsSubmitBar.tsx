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
    <section className="sticky bottom-4 z-10 rounded-lg border border-sky-100/90 bg-white/92 p-3 shadow-[0_18px_44px_rgba(14,165,233,0.16),0_8px_22px_rgba(168,85,247,0.10)] ring-1 ring-fuchsia-100/45 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={cn("text-sm font-medium", saved ? "text-emerald-700" : "text-slate-500")}>
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
