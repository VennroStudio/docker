import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

export type ConfirmDialogState = {
  body: string;
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
  confirmLabel = "Run command",
  onCancel,
  onConfirm,
  title,
  tone = "primary",
}: ConfirmDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className={`dialog-icon dialog-icon-${tone}`}>
          <AlertTriangle size={22} />
        </div>
        <div className="dialog-copy">
          <h2 id="confirm-title">{title}</h2>
          <p>{body}</p>
        </div>
        <div className="dialog-actions">
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" tone={tone} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
