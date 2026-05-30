import type { AppText } from "@/entities/infrastructure";
import type { ServiceStatus, ServiceViewId, ViewId } from "@/entities/infrastructure";
import { HomeHero } from "./HomeHero";
import { ServiceGrid } from "./ServiceGrid";
import { WorkflowPanel } from "./WorkflowPanel";

type HomePageProps = {
  statuses: Partial<Record<ServiceViewId, ServiceStatus>>;
  text: AppText;
  onOpenView: (viewId: ViewId) => void;
};

export function HomePage({ onOpenView, statuses, text }: HomePageProps) {
  return (
    <div className="space-y-4">
      <HomeHero text={text} />
      <ServiceGrid statuses={statuses} text={text} onOpenService={onOpenView} />
      <WorkflowPanel text={text} />
    </div>
  );
}
