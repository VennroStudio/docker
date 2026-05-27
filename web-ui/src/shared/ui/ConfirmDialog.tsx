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
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/34 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <section
        className="grid w-full max-w-md gap-5 rounded-lg border border-sky-100 bg-white p-5 shadow-[0_24px_70px_rgba(14,165,233,0.16),0_12px_34px_rgba(168,85,247,0.12)] ring-1 ring-fuchsia-100/55"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div
          className={cn(
            "grid h-11 w-11 place-items-center rounded-lg border",
            tone === "danger"
              ? "border-red-300 bg-red-50 text-red-700 shadow-[0_8px_18px_rgba(249,115,22,0.16)]"
              : "border-teal-300 bg-teal-50 text-teal-700 shadow-[0_8px_18px_rgba(20,184,166,0.18)]",
          )}
        >
          <AlertTriangle size={22} />
        </div>
        <div className="space-y-2">
          <h2 id="confirm-title" className="text-lg font-bold text-slate-950">
            {title}
          </h2>
          <p className="text-sm leading-6 text-slate-600">{body}</p>
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
