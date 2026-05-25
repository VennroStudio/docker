import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/shared/lib";

export type ConfirmDialogState = {
  body: string;
  cancelLabel?: string;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  title: string;
};

type ConfirmDialogProps = ConfirmDialogState & {
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  body,
  cancelLabel = "Cancel",
  confirmLabel = "Run command",
  onCancel,
  onConfirm,
  title,
  tone = "primary",
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4 backdrop-blur-sm" role="presentation">
      <section
        className="grid w-full max-w-md gap-5 rounded-lg border border-zinc-700/80 bg-zinc-950 p-5 shadow-2xl shadow-black/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div
          className={cn(
            "grid h-11 w-11 place-items-center rounded-lg border",
            tone === "danger"
              ? "border-red-300/35 bg-red-500/12 text-red-200"
              : "border-teal-300/35 bg-teal-400/12 text-teal-200",
          )}
        >
          <AlertTriangle size={22} />
        </div>
        <div className="space-y-2">
          <h2 id="confirm-title" className="text-lg font-bold text-zinc-50">
            {title}
          </h2>
          <p className="text-sm leading-6 text-zinc-400">{body}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" tone={tone} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
