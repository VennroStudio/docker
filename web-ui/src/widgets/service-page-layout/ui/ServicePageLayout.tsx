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
      <section className="flex items-start justify-between gap-6 rounded-lg border border-sky-100/90 bg-white/78 p-5 shadow-[0_18px_42px_rgba(14,165,233,0.13),0_8px_22px_rgba(168,85,247,0.08)] ring-1 ring-fuchsia-100/55 backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase text-teal-700">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">{title || view.label}</h1>
          <span className="mt-2 block max-w-3xl text-sm leading-6 text-slate-600">{description}</span>
        </div>
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-teal-300 bg-gradient-to-br from-cyan-50 via-white to-fuchsia-50 text-teal-700 shadow-[0_12px_26px_rgba(20,184,166,0.18),0_5px_18px_rgba(168,85,247,0.14)]"
          aria-hidden="true"
        >
          <Icon size={54} strokeWidth={1.7} />
        </div>
      </section>

      <div>{children}</div>
    </div>
  );
}
