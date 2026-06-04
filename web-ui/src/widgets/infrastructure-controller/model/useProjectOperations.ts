import type { AppText, Project, ProjectAction, ProjectForm } from "@/entities/infrastructure";
import {
  hostPreview,
  openHostTerminal,
  openProjectActionTerminal,
  openProjectCreateTerminal,
  openProjectRemoveTerminal,
  openProjectShellTerminal,
  openProjectUpdateTerminal,
  openProxyDeleteTerminal,
  openProxyTerminal,
  proxyDeletePreview,
  proxyPreview,
} from "@/features/command-terminal";
import type { ConfirmDialogApi, RunWithTerminal } from "./operationTypes";

type UseProjectOperationsConfig = {
  confirmDialog: ConfirmDialogApi;
  refreshProjects: () => void;
  runWithTerminal: RunWithTerminal;
  text: AppText;
};

const actionLabels: Record<ProjectAction, keyof AppText["projects"]["actions"]> = {
  clean: "clean",
  down: "down",
  logs: "logs",
  start: "start",
  stop: "stop",
  up: "up",
};

export function useProjectOperations({
  confirmDialog,
  refreshProjects,
  runWithTerminal,
  text,
}: UseProjectOperationsConfig) {
  const runProjectCreate = (form: ProjectForm) => {
    runWithTerminal({
      key: `project:${form.name}:create`,
      label: text.projects.actions.create,
      onSettled: refreshProjects,
      open: (handlers) => openProjectCreateTerminal(form, handlers),
      preview: projectPreview("project-create", form),
    });
  };

  const runProjectUpdate = (form: ProjectForm) => {
    runWithTerminal({
      key: `project:${form.name}:update`,
      label: text.projects.actions.edit,
      onSettled: refreshProjects,
      open: (handlers) => openProjectUpdateTerminal(form, handlers),
      preview: projectPreview("project-update", form),
    });
  };

  const runProjectRemove = async (project: Project) => {
    const confirmed = await confirmDialog.confirm({
      body: text.confirm.runCommand.body(`project-remove ${project.name}`),
      cancelLabel: text.common.cancel,
      confirmLabel: text.confirm.runCommand.confirmLabel,
      title: text.projects.actions.remove,
      tone: "danger",
    });
    if (!confirmed) return;

    runWithTerminal({
      key: `project:${project.name}:remove`,
      label: text.projects.actions.remove,
      onSettled: refreshProjects,
      open: (handlers) => openProjectRemoveTerminal(project.name, handlers),
      preview: `make project-remove NAME=${project.name} FORCE=1`,
    });
  };

  const runProjectAction = async (project: Project, action: ProjectAction) => {
    if (action === "clean" || action === "down" || action === "stop") {
      const confirmed = await confirmDialog.confirm({
        body: text.confirm.runCommand.body(`project-${action} ${project.name}`),
        cancelLabel: text.common.cancel,
        confirmLabel: text.confirm.runCommand.confirmLabel,
        title: text.projects.actions[actionLabels[action]],
        tone: "danger",
      });
      if (!confirmed) return;
    }

    runWithTerminal({
      key: `project:${project.name}:${action}`,
      label: text.projects.actions[actionLabels[action]],
      onSettled: refreshProjects,
      open: (handlers) => openProjectActionTerminal(project.name, action, handlers),
      preview: `make project-${action} NAME=${project.name}`,
    });
  };

  const runProjectShell = (project: Project) => {
    runWithTerminal({
      key: `project:${project.name}:shell`,
      label: text.projects.actions.shell,
      open: (handlers) => openProjectShellTerminal(project.name, handlers),
      preview: `make project-shell NAME=${project.name}`,
    });
  };

  const runProjectProxy = (project: Project, domain: string) => {
    const form = projectProxyForm(project, domain);
    runWithTerminal({
      key: `project:${project.name}:proxy:create`,
      label: text.panels.proxy.createProxy,
      onSettled: refreshProjects,
      open: (handlers) => openProxyTerminal(form, handlers),
      preview: proxyPreview(form),
    });
  };

  const runProjectProxyDelete = async (project: Project, domain: string) => {
    const confirmed = await confirmDialog.confirm({
      body: text.confirm.deleteProxy.body(domain),
      cancelLabel: text.common.cancel,
      confirmLabel: text.confirm.deleteProxy.confirmLabel,
      title: text.confirm.deleteProxy.title,
      tone: "danger",
    });
    if (!confirmed) return;

    runWithTerminal({
      key: `project:${project.name}:proxy:delete`,
      label: text.panels.proxy.deleteProxy,
      onSettled: refreshProjects,
      open: (handlers) => openProxyDeleteTerminal(domain, handlers),
      preview: proxyDeletePreview(domain),
    });
  };

  const runProjectHost = async (project: Project, domain: string, action: "add" | "remove") => {
    if (action === "remove") {
      const confirmed = await confirmDialog.confirm({
        body: text.confirm.deleteHost.body(domain),
        cancelLabel: text.common.cancel,
        confirmLabel: text.confirm.deleteHost.confirmLabel,
        title: text.confirm.deleteHost.title,
        tone: "danger",
      });
      if (!confirmed) return;
    }

    runWithTerminal({
      key: `project:${project.name}:host:${action}`,
      label: action === "add" ? text.panels.proxy.addHost : text.panels.proxy.removeHost,
      onSettled: refreshProjects,
      open: (handlers) => openHostTerminal(action, domain, handlers),
      preview: hostPreview(action, domain),
    });
  };

  return {
    runProjectAction,
    runProjectCreate,
    runProjectHost,
    runProjectProxy,
    runProjectProxyDelete,
    runProjectRemove,
    runProjectShell,
    runProjectUpdate,
  };
}

function projectProxyForm(project: Project, domain: string) {
  return {
    domain,
    port: String(project.web.proxyPort || 80),
    ssl: false,
    target: project.web.proxyTarget,
  };
}

function projectPreview(command: "project-create" | "project-update", form: ProjectForm) {
  return [
    "make",
    command,
    `NAME=${form.name}`,
    `WEB_STACK=${form.webStack}`,
    form.documentRoot ? `DOCUMENT_ROOT=${form.documentRoot}` : "",
    form.webPort ? `WEB_PORT=${form.webPort}` : "",
    form.phpVersion ? `PHP_VERSION=${form.phpVersion}` : "",
    form.enableNode ? `NODE_VERSION=${form.nodeVersion}` : "",
    form.enableNode ? `NODE_PACKAGE_MANAGER=${form.nodePackageManager}` : "",
    !form.enableNode && form.webStack !== "node" ? "REMOVE_RUNTIMES=node" : "",
  ]
    .filter(Boolean)
    .join(" ");
}
