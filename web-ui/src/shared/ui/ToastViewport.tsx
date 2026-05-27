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
  danger: "border-red-200 bg-red-50 text-red-800 shadow-[0_12px_30px_rgba(249,115,22,0.16)]",
  info: "border-sky-100 bg-white text-slate-900 shadow-[0_12px_30px_rgba(14,165,233,0.14)]",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-[0_12px_30px_rgba(34,197,94,0.14)]",
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
            "pointer-events-auto grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 rounded-lg border p-3 backdrop-blur",
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
