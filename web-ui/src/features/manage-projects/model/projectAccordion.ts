import type { ContainerRuntimeState, Project, ProjectAction } from "@/entities/infrastructure";

export const projectActionOrder: ProjectAction[] = ["up", "down", "start", "stop", "logs", "clean"];

export function operationKey(project: Project, action: ProjectAction) {
  return `project:${project.name}:${action}`;
}

export function projectStateForControls(project: Project): ContainerRuntimeState {
  if (project.state === "partial") return "restarting";
  if (project.state === "stopped") return "stopped";
  if (project.state === "missing") return "missing";
  if (project.state === "running") return "running";
  return "unknown";
}

export function domainFromUrl(url?: string) {
  if (!url) return "";
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export function urlFromDomain(domain: string, currentUrl?: string) {
  const scheme = schemeFromUrl(currentUrl) || "http";
  return `${scheme}://${domain}`;
}

function schemeFromUrl(url?: string) {
  if (!url) return "";
  try {
    return new URL(url).protocol.replace(":", "") || "";
  } catch {
    return "";
  }
}
