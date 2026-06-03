import { Pencil, Trash2 } from "lucide-react";
import type { AppText, Project } from "@/entities/infrastructure";
import { ContainerStateBadge } from "@/entities/infrastructure";
import { IconButton } from "@/shared/ui";
import { ProjectInfoBlock, ProjectInfoRow } from "./ProjectInfoBlock";

type ProjectDetailsProps = {
  activeOperationKey?: null | string;
  copy: AppText["projects"];
  operationDisabled?: boolean;
  project: Project;
  onEdit: (project: Project) => void;
  onRemove: (project: Project) => void;
};

export function ProjectDetails({
  activeOperationKey = null,
  copy,
  onEdit,
  onRemove,
  operationDisabled = false,
  project,
}: ProjectDetailsProps) {
  const removing = operationDisabled && activeOperationKey === `project:${project.name}:remove`;

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <ProjectInfoBlock title={copy.sections.web}>
          <ProjectInfoRow label={copy.fields.webStack} value={project.web.stack} />
          <ProjectInfoRow label={copy.fields.documentRoot} value={project.web.documentRoot} />
          <ProjectInfoRow label={copy.fields.webPort} value={String(project.web.proxyPort)} />
          <ProjectInfoRow label="Proxy target" value={project.web.proxyTarget} />
        </ProjectInfoBlock>

        <ProjectInfoBlock title={copy.runtime}>
          {Object.entries(project.runtimes).map(([name, runtime]) => (
            <ProjectInfoRow
              key={name}
              label={name}
              value={[runtime.version, runtime.preset, runtime.packageManager, runtime.packageManagers?.join(", ")]
                .filter(Boolean)
                .join(" / ")}
            />
          ))}
        </ProjectInfoBlock>
      </div>

      <ProjectInfoBlock title={copy.containers}>
        <div className="grid gap-2 md:grid-cols-2">
          {project.containers.map((container) => (
            <div
              key={container.container}
              className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-sky-100 bg-white/80 px-3 py-2"
            >
              <span className="min-w-0 truncate text-sm font-semibold text-slate-700">{container.container}</span>
              <ContainerStateBadge state={container.state} />
            </div>
          ))}
        </div>
      </ProjectInfoBlock>

      <ProjectInfoBlock title={copy.sections.details}>
        <div className="flex flex-wrap gap-2">
          <IconButton disabled={operationDisabled} label={copy.actions.edit} onClick={() => onEdit(project)}>
            <Pencil size={16} strokeWidth={2.5} />
          </IconButton>
          <IconButton
            disabled={operationDisabled}
            label={copy.actions.remove}
            loading={removing}
            tone="danger"
            onClick={() => onRemove(project)}
          >
            <Trash2 size={16} strokeWidth={2.5} />
          </IconButton>
        </div>
      </ProjectInfoBlock>
    </>
  );
}
