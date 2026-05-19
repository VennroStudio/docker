import type { ReactNode } from "react";
import type { ViewConfig } from "../../shared/types/commands";

type ServicePageProps = {
  children: ReactNode;
  description: string;
  eyebrow: string;
  view: ViewConfig;
};

export function ServicePage({ children, description, eyebrow, view }: ServicePageProps) {
  const Icon = view.icon;

  return (
    <div className="service-page">
      <section className="service-page-hero">
        <div>
          <p>{eyebrow}</p>
          <h1>{view.label}</h1>
          <span>{description}</span>
        </div>
        <div className="service-page-icon" aria-hidden="true">
          <Icon size={54} strokeWidth={1.7} />
        </div>
      </section>

      <div className="service-page-content">{children}</div>
    </div>
  );
}
