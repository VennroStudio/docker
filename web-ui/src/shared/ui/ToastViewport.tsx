import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/shared/lib";

export type ToastTone = "danger" | "info" | "success";

export type ToastMessage = {
  id: string;
  message?: string;
  title: string;
  tone: ToastTone;
};

type ToastViewportProps = {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
};

const toneClass = {
  danger: "border-red-300/25 bg-red-950/92 text-red-50",
  info: "border-teal-300/25 bg-zinc-950/94 text-zinc-50",
  success: "border-emerald-300/25 bg-emerald-950/92 text-emerald-50",
};

const toneIcon = {
  danger: <XCircle size={17} strokeWidth={2.4} />,
  info: <Info size={17} strokeWidth={2.4} />,
  success: <CheckCircle2 size={17} strokeWidth={2.4} />,
};

export function ToastViewport({ onDismiss, toasts }: ToastViewportProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 grid w-[min(360px,calc(100vw-32px))] gap-2">
      {toasts.map((toast) => (
        <article
          key={toast.id}
          className={cn(
            "pointer-events-auto grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 rounded-lg border p-3 shadow-2xl shadow-black/35 backdrop-blur",
            toneClass[toast.tone],
          )}
        >
          <span className="mt-0.5">{toneIcon[toast.tone]}</span>
          <span className="min-w-0">
            <strong className="block text-sm leading-5">{toast.title}</strong>
            {toast.message ? <span className="mt-0.5 block text-xs text-current/70">{toast.message}</span> : null}
          </span>
          <button
            aria-label="Close"
            className="grid h-7 w-7 place-items-center rounded-md text-current/60 transition hover:bg-white/10 hover:text-current"
            type="button"
            onClick={() => onDismiss(toast.id)}
          >
            <X size={15} strokeWidth={2.4} />
          </button>
        </article>
      ))}
    </div>
  );
}
