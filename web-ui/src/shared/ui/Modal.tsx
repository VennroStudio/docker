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
      className="fixed inset-0 z-50 grid place-items-center bg-black/62 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        aria-modal="true"
        className="w-full max-w-2xl rounded-lg border border-zinc-700/80 bg-zinc-950 shadow-2xl shadow-black/50"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-4 border-b border-zinc-800 px-5 py-4">
          <h2 className="text-lg font-bold text-zinc-50">{title}</h2>
          <button
            aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-lg border border-zinc-700/80 text-zinc-200 transition hover:border-zinc-500 hover:bg-white/[0.06]"
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
