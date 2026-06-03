import { ExternalLink } from "lucide-react";
import type { AppText, Project, ProjectAction } from "@/entities/infrastructure";
import { ContainerActionButton, ShellIconButton } from "@/entities/infrastructure";
import { IconLink } from "@/shared/ui";
import { operationKey, projectActionOrder, projectStateForControls } from "../model/projectAccordion";

type ProjectHeaderActionsProps = {
  activeOperationKey?: null | string;
  copy: AppText["projects"];
  link?: { label: string; url: string };
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  project: Project;
  onAction: (project: Project, action: ProjectAction) => void;
  onShell: (project: Project) => void;
};

export function ProjectHeaderActions({
  activeOperationKey = null,
  copy,
  link,
  onAction,
  onShell,
  operationDisabled = false,
  operationDisabledTitle = "",
  project,
}: ProjectHeaderActionsProps) {
  const running = projectStateForControls(project) === "running";
  const loading = (key: string) => operationDisabled && activeOperationKey === key;
  const actionTitle = (key: string, label: string, disabled?: boolean) =>
    operationDisabled && activeOperationKey !== key ? operationDisabledTitle : disabled ? label : label;
  const shellKey = `project:${project.name}:shell`;

  return (
    <>
      {link ? (
        <IconLink href={link.url} label={link.label} title={link.url}>
          <ExternalLink size={16} strokeWidth={2.5} />
        </IconLink>
      ) : null}
      {projectActionOrder.map((action) => {
        const key = operationKey(project, action);
        const disabled = action !== "up" && !running;
        return (
          <ContainerActionButton
            key={action}
            action={action}
            disabled={operationDisabled || disabled}
            label={copy.actions[action]}
            loading={loading(key)}
            title={actionTitle(key, copy.actions[action], disabled)}
            onClick={() => onAction(project, action)}
          />
        );
      })}
      <ShellIconButton
        disabled={operationDisabled || !running}
        label={copy.actions.shell}
        loading={loading(shellKey)}
        title={actionTitle(shellKey, copy.actions.shell, !running)}
        onClick={() => onShell(project)}
      />
    </>
  );
}
