import { ArrowUpRight, FolderOpen } from "lucide-react";
import type { AppText, Project, useProjects } from "@/entities/infrastructure";

type HomeProjectsPanelProps = {
  projectsState: ReturnType<typeof useProjects>;
  text: AppText;
  onOpenProject: (projectName: string) => void;
};

export function HomeProjectsPanel({ onOpenProject, projectsState, text }: HomeProjectsPanelProps) {
  const copy = text.home.projects;
  const projects = projectsState.projects;

  return (
    <section className="rounded-lg border border-sky-100/90 bg-white/70 p-4 shadow-[0_14px_34px_rgba(14,165,233,0.11),0_6px_18px_rgba(168,85,247,0.07)] ring-1 ring-fuchsia-100/40 backdrop-blur">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{copy.eyebrow}</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">{copy.title}</h2>
        </div>
        <span className="rounded-md border border-sky-100 bg-sky-50 px-2 py-1 text-xs font-bold text-slate-500 shadow-[0_4px_10px_rgba(14,165,233,0.10)]">
          {copy.countLabel(projects.length)}
        </span>
      </div>

      {projectsState.error ? <p className="text-sm font-semibold text-red-600">{projectsState.error}</p> : null}
      {projectsState.loading ? <p className="text-sm font-semibold text-slate-500">{copy.loading}</p> : null}

      <div className="mt-3 grid gap-2">
        {projects.map((project) => (
          <ProjectRow key={project.name} project={project} text={text} onOpen={() => onOpenProject(project.name)} />
        ))}
      </div>

      {!projectsState.loading && projects.length === 0 ? (
        <p className="mt-3 rounded-lg border border-sky-100 bg-white/76 px-3 py-3 text-sm font-semibold text-slate-500 shadow-[0_8px_18px_rgba(14,165,233,0.08)]">
          {copy.empty}
        </p>
      ) : null}
    </section>
  );
}

function ProjectRow({ onOpen, project, text }: { project: Project; text: AppText; onOpen: () => void }) {
  const displayTarget = project.web.url || project.path;

  return (
    <button
      aria-label={text.home.projects.openLabel(project.name)}
      className="group grid min-h-20 grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-sky-100 bg-white/82 px-3 py-3 text-left shadow-[0_10px_22px_rgba(14,165,233,0.08),0_4px_12px_rgba(168,85,247,0.05)] transition hover:border-teal-300 hover:bg-teal-50/35 hover:shadow-[0_14px_30px_rgba(14,165,233,0.13),0_6px_18px_rgba(168,85,247,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30"
      type="button"
      onClick={onOpen}
    >
      <span className="grid h-10 w-10 place-items-center rounded-lg border border-teal-300 bg-gradient-to-br from-cyan-50 via-white to-fuchsia-50 text-teal-700 shadow-[0_8px_18px_rgba(20,184,166,0.14)]">
        <FolderOpen size={18} strokeWidth={2.35} />
      </span>
      <span className="min-w-0">
        <span className="mb-1 flex flex-wrap items-center gap-2">
          <small className="text-xs font-semibold uppercase text-slate-500">{project.web.stack}</small>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-100 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 shadow-[0_4px_10px_rgba(14,165,233,0.08)]">
            <span className={`h-1.5 w-1.5 rounded-full ${projectStateClass(project.state)}`} />
            {text.common.statusLabels[project.state]}
          </span>
        </span>
        <strong className="block truncate text-base font-bold text-slate-950">{project.name}</strong>
        <span className="mt-1 block truncate text-sm text-slate-600">{displayTarget}</span>
      </span>
      <ArrowUpRight
        className="shrink-0 text-slate-400 transition group-hover:text-teal-700"
        size={16}
        strokeWidth={2.4}
      />
    </button>
  );
}

function projectStateClass(state: Project["state"]) {
  if (state === "running") return "bg-[#52ff8f] shadow-[0_0_12px_rgba(82,255,143,0.75)]";
  if (state === "partial") return "bg-teal-300";
  if (state === "stopped") return "bg-amber-300";
  return "bg-slate-400";
}
