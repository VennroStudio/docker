import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  eyebrow: string;
  badge?: string;
  children: ReactNode;
};

export function Panel({ badge, children, eyebrow, title }: PanelProps) {
  return (
    <section className="panel">
      <header className="panel-head">
        <div>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        {badge ? <span className="panel-badge">{badge}</span> : null}
      </header>
      {children}
    </section>
  );
}
