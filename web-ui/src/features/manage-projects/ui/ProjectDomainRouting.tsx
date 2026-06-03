import { Globe2, Link2, Trash2, Unlink2 } from "lucide-react";
import type { AppText, Project } from "@/entities/infrastructure";
import { InfoLine } from "@/entities/infrastructure";
import { IconButton } from "@/shared/ui";
import { ProjectInfoBlock } from "./ProjectInfoBlock";

type ProjectDomainRoutingProps = {
  activeOperationKey?: null | string;
  copy: AppText["projects"];
  domain: string;
  link?: { url: string };
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  project: Project;
  proxyCopy: AppText["panels"]["proxy"];
  onDomainChange: (domain: string) => void;
  onHost: (project: Project, domain: string, action: "add" | "remove") => void;
  onProxyCreate: (project: Project, domain: string) => void;
  onProxyDelete: (project: Project, domain: string) => void;
};

export function ProjectDomainRouting({
  activeOperationKey = null,
  copy,
  domain,
  link,
  onDomainChange,
  onHost,
  onProxyCreate,
  onProxyDelete,
  operationDisabled = false,
  operationDisabledTitle = "",
  project,
  proxyCopy,
}: ProjectDomainRoutingProps) {
  const cleanDomain = domain.trim();
  const domainReady = /^[a-zA-Z0-9.-]+$/.test(cleanDomain);
  const loading = (key: string) => operationDisabled && activeOperationKey === key;
  const actionTitle = (key: string, label: string, disabledReason: string) =>
    operationDisabled && activeOperationKey !== key ? operationDisabledTitle : domainReady ? label : disabledReason;

  return (
    <ProjectInfoBlock title={proxyCopy.title}>
      <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-end">
        <label className="min-w-0">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase text-slate-500">{proxyCopy.domain}</span>
          <input
            className="min-h-10 w-full rounded-lg border border-sky-100 bg-white px-3 text-sm font-semibold text-slate-800 shadow-[0_7px_16px_rgba(14,165,233,0.10)] outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-200/60"
            placeholder="project.local"
            value={domain}
            onChange={(event) => onDomainChange(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <IconButton
            disabled={operationDisabled || !domainReady}
            label={proxyCopy.createProxy}
            loading={loading(`project:${project.name}:proxy:create`)}
            title={actionTitle(
              `project:${project.name}:proxy:create`,
              proxyCopy.createProxy,
              proxyCopy.validation.proxyDisabled,
            )}
            tone="primary"
            onClick={() => onProxyCreate(project, cleanDomain)}
          >
            <Link2 size={16} strokeWidth={2.4} />
          </IconButton>
          <IconButton
            disabled={operationDisabled || !domainReady}
            label={proxyCopy.addHost}
            loading={loading(`project:${project.name}:host:add`)}
            title={actionTitle(
              `project:${project.name}:host:add`,
              proxyCopy.addHost,
              proxyCopy.validation.hostDisabled,
            )}
            onClick={() => onHost(project, cleanDomain, "add")}
          >
            <Globe2 size={16} strokeWidth={2.4} />
          </IconButton>
          <IconButton
            disabled={operationDisabled || !domainReady}
            label={proxyCopy.deleteProxy}
            loading={loading(`project:${project.name}:proxy:delete`)}
            title={actionTitle(
              `project:${project.name}:proxy:delete`,
              proxyCopy.deleteProxy,
              proxyCopy.validation.hostDisabled,
            )}
            tone="danger"
            onClick={() => onProxyDelete(project, cleanDomain)}
          >
            <Unlink2 size={16} strokeWidth={2.4} />
          </IconButton>
          <IconButton
            disabled={operationDisabled || !domainReady}
            label={proxyCopy.removeHost}
            loading={loading(`project:${project.name}:host:remove`)}
            title={actionTitle(
              `project:${project.name}:host:remove`,
              proxyCopy.removeHost,
              proxyCopy.validation.hostDisabled,
            )}
            tone="danger"
            onClick={() => onHost(project, cleanDomain, "remove")}
          >
            <Trash2 size={16} strokeWidth={2.4} />
          </IconButton>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <InfoLine label={proxyCopy.target} value={project.web.proxyTarget} />
        <InfoLine label={proxyCopy.hints.port} value={String(project.web.proxyPort || 80)} />
        <InfoLine href={link?.url} label={copy.fields.link} value={link?.url || "-"} />
      </div>
    </ProjectInfoBlock>
  );
}
