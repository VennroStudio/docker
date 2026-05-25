import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  eyebrow: string;
  badge?: string;
  children: ReactNode;
};

export function Panel({ badge, children, eyebrow, title }: PanelProps) {
  return (
    <section className="rounded-lg border border-zinc-800/90 bg-zinc-950/58 p-4 shadow-sm shadow-black/20">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-teal-300/80">{eyebrow}</p>
          <h2 className="mt-1 text-lg font-bold text-zinc-50">{title}</h2>
        </div>
        {badge ? (
          <span className="rounded-md border border-zinc-700/80 bg-zinc-900 px-2 py-1 text-xs font-bold text-zinc-300">
            {badge}
          </span>
        ) : null}
      </header>
      {children}
    </section>
  );
}
