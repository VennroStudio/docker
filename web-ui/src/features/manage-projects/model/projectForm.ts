import type { Project, ProjectForm, ProjectRuntimeCatalog, ProjectWebStack } from "@/entities/infrastructure";

export function createProjectForm(catalog: ProjectRuntimeCatalog): ProjectForm {
  return {
    documentRoot: "public",
    enableNode: false,
    name: "",
    nodePackageManager: catalog.node?.packageManagers?.[0] || "npm",
    nodeVersion: catalog.node?.defaultVersion || catalog.node?.versions?.[0] || "24",
    phpVersion: catalog.php?.defaultVersion || catalog.php?.versions?.[0] || "8.4",
    webCommand: "",
    webPort: "80",
    webStack: "nginx",
  };
}

export function projectToForm(project: Project, catalog: ProjectRuntimeCatalog): ProjectForm {
  const php = project.runtimes.php;
  const node = project.runtimes.node;

  return {
    documentRoot: project.web.documentRoot || defaultDocumentRoot(project.web.stack),
    enableNode: Boolean(node),
    name: project.name,
    nodePackageManager: node?.packageManager || catalog.node?.packageManagers?.[0] || "npm",
    nodeVersion: node?.version || catalog.node?.defaultVersion || "24",
    phpVersion: php?.version || catalog.php?.defaultVersion || "8.4",
    webCommand: project.web.command || "",
    webPort: String(project.web.proxyPort || 80),
    webStack: project.web.stack,
  };
}

export function defaultDocumentRoot(stack: ProjectWebStack) {
  if (stack === "nginx") return "public";
  return ".";
}

export function defaultWebPort(stack: ProjectWebStack) {
  return stack === "node" ? "5173" : "80";
}

export function validateProjectForm(
  form: ProjectForm,
  messages: { name: string; nodeVersion: string; phpVersion: string },
) {
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(form.name.trim())) return messages.name;
  if ((form.webStack === "apache" || form.webStack === "nginx") && !form.phpVersion.trim()) return messages.phpVersion;
  if ((form.webStack === "node" || form.enableNode) && !form.nodeVersion.trim()) return messages.nodeVersion;
  return "";
}
