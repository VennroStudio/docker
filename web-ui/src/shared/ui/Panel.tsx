import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  eyebrow: string;
  badge?: string;
  children: ReactNode;
};

export function Panel({ badge, children, eyebrow, title }: PanelProps) {
  return (
    <section className="rounded-lg border border-sky-100/90 bg-white/76 p-4 shadow-[0_14px_34px_rgba(14,165,233,0.12),0_6px_18px_rgba(168,85,247,0.07)] ring-1 ring-fuchsia-100/45 backdrop-blur">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-teal-700">{eyebrow}</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">{title}</h2>
        </div>
        {badge ? (
          <span className="rounded-md border border-sky-100 bg-sky-50 px-2 py-1 text-xs font-bold text-slate-500 shadow-[0_4px_10px_rgba(14,165,233,0.10)]">
            {badge}
          </span>
        ) : null}
      </header>
      {children}
    </section>
  );
}
