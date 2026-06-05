import type { AppText } from "@/entities/infrastructure";
import type { HomeCardViewId, ServiceStatus, ViewId, useProjects } from "@/entities/infrastructure";
import { HomeHero } from "./HomeHero";
import { HomeProjectsPanel } from "./HomeProjectsPanel";
import { ServiceGrid } from "./ServiceGrid";
import { WorkflowPanel } from "./WorkflowPanel";

type HomePageProps = {
  projectsState: ReturnType<typeof useProjects>;
  statuses: Partial<Record<ViewId, ServiceStatus>>;
  text: AppText;
  onOpenProject: (projectName: string) => void;
  onOpenView: (viewId: HomeCardViewId) => void;
};

export function HomePage({ onOpenProject, onOpenView, projectsState, statuses, text }: HomePageProps) {
  return (
    <div className="space-y-4">
      <HomeHero text={text} />
      <ServiceGrid statuses={statuses} text={text} onOpenService={onOpenView} />
      <HomeProjectsPanel projectsState={projectsState} text={text} onOpenProject={onOpenProject} />
      <WorkflowPanel text={text} />
    </div>
  );
}
