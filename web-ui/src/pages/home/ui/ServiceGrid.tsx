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
    <section className="rounded-lg border border-zinc-800/90 bg-zinc-950/42 p-4">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-zinc-500">{text.home.services.eyebrow}</p>
          <h2 className="mt-1 text-xl font-bold text-zinc-50">{text.home.services.title}</h2>
        </div>
        <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs font-bold text-zinc-400">
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
