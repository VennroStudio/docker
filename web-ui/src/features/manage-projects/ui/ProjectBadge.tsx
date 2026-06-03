import type { Project } from "@/entities/infrastructure";
import { ContainerStateBadge, StatusDot } from "@/entities/infrastructure";
import { projectStateForControls } from "../model/projectAccordion";

export function ProjectBadge({ project }: { project: Project }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className="inline-flex rounded-md border border-sky-100 bg-sky-50 px-2 py-1 text-xs font-bold uppercase text-slate-500 shadow-[0_4px_10px_rgba(14,165,233,0.10)]">
        {project.web.stack}
      </span>
      <ContainerStateBadge state={projectStateForControls(project)} />
    </span>
  );
}

export function ProjectStatusDot({ project }: { project: Project }) {
  return <StatusDot state={projectStateForControls(project)} />;
}
