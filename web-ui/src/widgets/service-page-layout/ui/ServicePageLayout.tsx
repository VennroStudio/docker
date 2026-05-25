import type { ReactNode } from "react";
import type { ViewConfig } from "@/entities/infrastructure";

type ServicePageLayoutProps = {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title?: string;
  view: ViewConfig;
};

export function ServicePageLayout({ children, description, eyebrow, title, view }: ServicePageLayoutProps) {
  const Icon = view.icon;

  return (
    <div className="space-y-4">
      <section className="flex items-start justify-between gap-6 rounded-lg border border-zinc-800/90 bg-zinc-950/52 p-5 shadow-sm shadow-black/20">
        <div>
          <p className="text-xs font-semibold uppercase text-teal-300/80">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-50">{title || view.label}</h1>
          <span className="mt-2 block max-w-3xl text-sm leading-6 text-zinc-400">{description}</span>
        </div>
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-teal-200"
          aria-hidden="true"
        >
          <Icon size={54} strokeWidth={1.7} />
        </div>
      </section>

      <div>{children}</div>
    </div>
  );
}
