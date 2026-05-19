import type { AppText } from "../../../shared/i18n";
import type { ServiceStatus, ServiceViewId, ViewId } from "../../../shared/types/commands";
import { homeServices } from "../model/homeSections";
import { ServiceTile } from "./ServiceTile";

type ServiceGridProps = {
  statuses: Partial<Record<ServiceViewId, ServiceStatus>>;
  text: AppText;
  onOpenService: (viewId: ViewId) => void;
};

export function ServiceGrid({ onOpenService, statuses, text }: ServiceGridProps) {
  return (
    <section className="home-section">
      <div className="home-section-head">
        <div>
          <p>{text.home.services.eyebrow}</p>
          <h2>{text.home.services.title}</h2>
        </div>
        <span>
          {homeServices.length} {text.common.panels}
        </span>
      </div>

      <div className="service-grid">
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
