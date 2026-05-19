import { ArrowUpRight } from "lucide-react";
import { getViewById } from "../../../shared/config/views";
import type { AppText } from "../../../shared/i18n";
import type { ServiceStatus, ViewId } from "../../../shared/types/commands";
import type { HomeService } from "../model/homeSections";

type ServiceTileProps = {
  service: HomeService;
  status?: ServiceStatus;
  text: AppText;
  onOpen: (viewId: ViewId) => void;
};

export function ServiceTile({ onOpen, service, status, text }: ServiceTileProps) {
  const view = getViewById(service.id);
  const Icon = view.icon;
  const card = text.home.serviceCards[service.id];

  return (
    <button className="service-tile" type="button" onClick={() => onOpen(service.id)}>
      <span className="service-icon">
        <Icon size={19} strokeWidth={2.25} />
      </span>
      <span className="service-copy">
        <span className="service-meta-row">
          <small>{card?.meta}</small>
          {status ? (
            <span className={`service-status service-status-${status.state}`}>
              <span />
              {text.common.statusLabels[status.state]} {status.running}/{status.total}
            </span>
          ) : null}
        </span>
        <strong>{card?.title}</strong>
        <span>{card?.description}</span>
      </span>
      <ArrowUpRight className="service-arrow" size={16} strokeWidth={2.4} />
    </button>
  );
}
