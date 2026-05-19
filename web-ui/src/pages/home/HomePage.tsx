import type { AppText } from "../../shared/i18n";
import type { ServiceStatus, ServiceViewId, ViewId } from "../../shared/types/commands";
import { HomeHero } from "./ui/HomeHero";
import { ServiceGrid } from "./ui/ServiceGrid";
import { WorkflowPanel } from "./ui/WorkflowPanel";

type HomePageProps = {
  statuses: Partial<Record<ServiceViewId, ServiceStatus>>;
  text: AppText;
  onOpenView: (viewId: ViewId) => void;
};

export function HomePage({ onOpenView, statuses, text }: HomePageProps) {
  return (
    <div className="home-page">
      <HomeHero text={text} onOpenProxy={() => onOpenView("proxy")} />
      <ServiceGrid statuses={statuses} text={text} onOpenService={onOpenView} />
      <WorkflowPanel text={text} />
    </div>
  );
}
