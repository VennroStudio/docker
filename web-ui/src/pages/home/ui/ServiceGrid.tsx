import type { AppText } from "@/entities/infrastructure";
import type { HomeCardViewId, ServiceStatus, ViewId } from "@/entities/infrastructure";
import { homeModules, homeServices } from "../model/homeSections";
import type { HomeService } from "../model/homeSections";
import { ServiceTile } from "./ServiceTile";

type ServiceGridProps = {
  statuses: Partial<Record<ViewId, ServiceStatus>>;
  text: AppText;
  onOpenService: (viewId: HomeCardViewId) => void;
};

export function ServiceGrid({ onOpenService, statuses, text }: ServiceGridProps) {
  return (
    <div className="space-y-4">
      <ServiceSection
        countLabel={panelCount(homeModules.length, text)}
        eyebrow={text.home.modules.eyebrow}
        services={homeModules}
        statuses={statuses}
        text={text}
        title={text.home.modules.title}
        onOpenService={onOpenService}
      />
      <ServiceSection
        countLabel={panelCount(homeServices.length, text)}
        eyebrow={text.home.services.eyebrow}
        services={homeServices}
        statuses={statuses}
        text={text}
        title={text.home.services.title}
        onOpenService={onOpenService}
      />
    </div>
  );
}

function panelCount(count: number, text: AppText) {
  return `${count} ${count === 1 ? text.common.panel : text.common.panels}`;
}

type ServiceSectionProps = {
  countLabel: string;
  eyebrow: string;
  services: HomeService[];
  statuses: Partial<Record<ViewId, ServiceStatus>>;
  text: AppText;
  title: string;
  onOpenService: (viewId: HomeCardViewId) => void;
};

function ServiceSection({ countLabel, eyebrow, onOpenService, services, statuses, text, title }: ServiceSectionProps) {
  return (
    <section className="rounded-lg border border-sky-100/90 bg-white/70 p-4 shadow-[0_14px_34px_rgba(14,165,233,0.11),0_6px_18px_rgba(168,85,247,0.07)] ring-1 ring-fuchsia-100/40 backdrop-blur">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">{title}</h2>
        </div>
        <span className="rounded-md border border-sky-100 bg-sky-50 px-2 py-1 text-xs font-bold text-slate-500 shadow-[0_4px_10px_rgba(14,165,233,0.10)]">
          {countLabel}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {services.map((service) => (
          <ServiceTile
            key={service.id}
            service={service}
            status={statuses[service.id]}
            text={text}
            onOpen={onOpenService}
          />
        ))}
      </div>
    </section>
  );
}
