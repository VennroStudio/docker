import type { AppText } from "@/entities/infrastructure";
import type { ServiceStatus, ServiceViewId, ViewId } from "@/entities/infrastructure";
import { homeServices } from "../model/homeSections";
import { ServiceTile } from "./ServiceTile";

type ServiceGridProps = {
  statuses: Partial<Record<ServiceViewId, ServiceStatus>>;
  text: AppText;
  onOpenService: (viewId: ViewId) => void;
};

export function ServiceGrid({ onOpenService, statuses, text }: ServiceGridProps) {
  return (
    <section className="rounded-lg border border-sky-100/90 bg-white/70 p-4 shadow-[0_14px_34px_rgba(14,165,233,0.11),0_6px_18px_rgba(168,85,247,0.07)] ring-1 ring-fuchsia-100/40 backdrop-blur">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{text.home.services.eyebrow}</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">{text.home.services.title}</h2>
        </div>
        <span className="rounded-md border border-sky-100 bg-sky-50 px-2 py-1 text-xs font-bold text-slate-500 shadow-[0_4px_10px_rgba(14,165,233,0.10)]">
          {homeServices.length} {text.common.panels}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {homeServices.map((service) => (
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
