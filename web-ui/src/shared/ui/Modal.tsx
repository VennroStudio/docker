import { X } from "lucide-react";
import type { ReactNode } from "react";

type ModalProps = {
  children: ReactNode;
  title: string;
  onClose: () => void;
};

export function Modal({ children, onClose, title }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/34 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        aria-modal="true"
        className="w-full max-w-2xl rounded-lg border border-sky-100 bg-white shadow-[0_24px_70px_rgba(14,165,233,0.16),0_12px_34px_rgba(168,85,247,0.12)] ring-1 ring-fuchsia-100/55"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-4 border-b border-sky-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <button
            aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-lg border border-sky-100 text-slate-500 shadow-[0_5px_14px_rgba(14,165,233,0.10)] transition hover:border-sky-200 hover:bg-sky-50 hover:text-slate-950"
            type="button"
            onClick={onClose}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
