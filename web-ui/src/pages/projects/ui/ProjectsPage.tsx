import { Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { AppText, Project, ProjectAction, ProjectForm, useProjects, ViewConfig } from "@/entities/infrastructure";
import { ProjectAccordion, ProjectModal, projectToForm } from "@/features/manage-projects";
import { Button } from "@/shared/ui";
import { ServicePageLayout } from "@/widgets/service-page-layout";

type ProjectsPageProps = {
  activeOperationKey?: null | string;
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  projectsState: ReturnType<typeof useProjects>;
  selectedProjectName?: string;
  text: AppText;
  view: ViewConfig;
  onProjectAction: (project: Project, action: ProjectAction) => void;
  onProjectCreate: (form: ProjectForm) => void;
  onProjectHost: (project: Project, domain: string, action: "add" | "remove") => void;
  onProjectProxyCreate: (project: Project, domain: string) => void;
  onProjectProxyDelete: (project: Project, domain: string) => void;
  onProjectRemove: (project: Project) => void;
  onProjectShell: (project: Project) => void;
  onProjectUpdate: (form: ProjectForm) => void;
};

export function ProjectsPage({
  activeOperationKey,
  onProjectAction,
  onProjectCreate,
  onProjectHost,
  onProjectProxyCreate,
  onProjectProxyDelete,
  onProjectRemove,
  onProjectShell,
  onProjectUpdate,
  operationDisabled = false,
  operationDisabledTitle,
  projectsState,
  selectedProjectName = "",
  text,
  view,
}: ProjectsPageProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const copy = text.projects;

  return (
    <ServicePageLayout view={view} eyebrow={copy.eyebrow} description={copy.description} title={copy.title}>
      <div className="space-y-4">
        <section className="flex flex-wrap items-center gap-3 rounded-lg border border-sky-100/90 bg-white/70 p-4 shadow-[0_14px_34px_rgba(14,165,233,0.11),0_6px_18px_rgba(168,85,247,0.07)] ring-1 ring-fuchsia-100/40 backdrop-blur">
          <Button
            disabled={operationDisabled}
            icon={<Plus size={18} strokeWidth={2.5} />}
            tone="primary"
            onClick={() => setCreateOpen(true)}
          >
            {copy.actions.create}
          </Button>
          <Button
            icon={<RefreshCw size={18} strokeWidth={2.5} />}
            loading={projectsState.loading}
            onClick={() => void projectsState.refresh()}
          >
            {copy.actions.refresh}
          </Button>
        </section>

        {projectsState.error ? <p className="text-sm font-semibold text-red-600">{projectsState.error}</p> : null}
        {projectsState.loading ? <p className="text-sm font-semibold text-slate-500">{copy.loading}</p> : null}

        <div className="space-y-4">
          {projectsState.projects.map((project) => (
            <ProjectAccordion
              key={project.name}
              activeOperationKey={activeOperationKey}
              copy={copy}
              initialOpen={project.name === selectedProjectName}
              operationDisabled={operationDisabled}
              operationDisabledTitle={operationDisabledTitle}
              project={project}
              proxyCopy={text.panels.proxy}
              onAction={onProjectAction}
              onEdit={setEditingProject}
              onHost={onProjectHost}
              onProxyCreate={onProjectProxyCreate}
              onProxyDelete={onProjectProxyDelete}
              onRemove={onProjectRemove}
              onShell={onProjectShell}
            />
          ))}
        </div>

        {!projectsState.loading && projectsState.projects.length === 0 ? (
          <section className="rounded-lg border border-sky-100 bg-white/70 p-4 text-sm font-semibold text-slate-500 shadow-[0_12px_26px_rgba(14,165,233,0.10)]">
            {copy.empty}
          </section>
        ) : null}
      </div>

      {createOpen ? (
        <ProjectModal
          catalog={projectsState.catalog}
          copy={copy}
          mode="create"
          onClose={() => setCreateOpen(false)}
          onSubmit={onProjectCreate}
        />
      ) : null}

      {editingProject ? (
        <ProjectModal
          catalog={projectsState.catalog}
          copy={copy}
          initialValue={projectToForm(editingProject, projectsState.catalog)}
          mode="edit"
          onClose={() => setEditingProject(null)}
          onSubmit={onProjectUpdate}
        />
      ) : null}
    </ServicePageLayout>
  );
}
