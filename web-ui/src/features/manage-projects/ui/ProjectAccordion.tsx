import { useState } from "react";
import type { AppText, Project, ProjectAction } from "@/entities/infrastructure";
import { AccordionPanel } from "@/shared/ui";
import { domainFromUrl, urlFromDomain } from "../model/projectAccordion";
import { ProjectBadge, ProjectStatusDot } from "./ProjectBadge";
import { ProjectDetails } from "./ProjectDetails";
import { ProjectDomainRouting } from "./ProjectDomainRouting";
import { ProjectHeaderActions } from "./ProjectHeaderActions";

type ProjectAccordionProps = {
  activeOperationKey?: null | string;
  copy: AppText["projects"];
  initialOpen?: boolean;
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  project: Project;
  proxyCopy: AppText["panels"]["proxy"];
  onAction: (project: Project, action: ProjectAction) => void;
  onEdit: (project: Project) => void;
  onHost: (project: Project, domain: string, action: "add" | "remove") => void;
  onProxyCreate: (project: Project, domain: string) => void;
  onProxyDelete: (project: Project, domain: string) => void;
  onRemove: (project: Project) => void;
  onShell: (project: Project) => void;
};

export function ProjectAccordion({
  activeOperationKey = null,
  copy,
  initialOpen = false,
  onAction,
  onEdit,
  onHost,
  onProxyCreate,
  onProxyDelete,
  onRemove,
  onShell,
  operationDisabled = false,
  operationDisabledTitle,
  project,
  proxyCopy,
}: ProjectAccordionProps) {
  const [open, setOpen] = useState(initialOpen);
  const [domain, setDomain] = useState(() => domainFromUrl(project.web.url));
  const cleanDomain = domain.trim();
  const currentUrl = /^[a-zA-Z0-9.-]+$/.test(cleanDomain)
    ? urlFromDomain(cleanDomain, project.web.url)
    : project.web.url || "";
  const link = currentUrl ? { label: project.name, url: currentUrl } : undefined;

  return (
    <AccordionPanel
      contentClassName="p-4"
      eyebrow={<ProjectBadge project={project} />}
      open={open}
      title={project.name}
      titlePrefix={<ProjectStatusDot project={project} />}
      actions={
        <ProjectHeaderActions
          activeOperationKey={activeOperationKey}
          copy={copy}
          link={link}
          operationDisabled={operationDisabled}
          operationDisabledTitle={operationDisabledTitle}
          project={project}
          onAction={onAction}
          onShell={onShell}
        />
      }
      onOpenChange={setOpen}
    >
      <div className="grid gap-4">
        <ProjectDomainRouting
          activeOperationKey={activeOperationKey}
          copy={copy}
          domain={domain}
          link={link}
          operationDisabled={operationDisabled}
          operationDisabledTitle={operationDisabledTitle}
          project={project}
          proxyCopy={proxyCopy}
          onDomainChange={setDomain}
          onHost={onHost}
          onProxyCreate={onProxyCreate}
          onProxyDelete={onProxyDelete}
        />
        <ProjectDetails
          activeOperationKey={activeOperationKey}
          copy={copy}
          operationDisabled={operationDisabled}
          project={project}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      </div>
    </AccordionPanel>
  );
}
