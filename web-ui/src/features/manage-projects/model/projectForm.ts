import type { Project, ProjectForm, ProjectRuntimeCatalog, ProjectWebStack } from "@/entities/infrastructure";

export function createProjectForm(catalog: ProjectRuntimeCatalog): ProjectForm {
  return {
    documentRoot: "public",
    enableNode: true,
    name: "",
    nodePackageManager: catalog.node?.packageManagers?.[0] || "npm",
    nodeVersion: catalog.node?.defaultVersion || catalog.node?.versions?.[0] || "24",
    phpExtensions: "",
    phpPreset: "laravel",
    phpVersion: catalog.php?.defaultVersion || catalog.php?.versions?.[0] || "8.4",
    webCommand: "npm run dev -- --host 0.0.0.0",
    webPort: "80",
    webStack: "nginx-fpm",
  };
}

export function projectToForm(project: Project, catalog: ProjectRuntimeCatalog): ProjectForm {
  const php = project.runtimes.php;
  const node = project.runtimes.node;
  const preset = php?.preset || "minimal";
  const presetExtensions = new Set(catalog.php?.presets?.[preset] || []);

  return {
    documentRoot: project.web.documentRoot || defaultDocumentRoot(project.web.stack),
    enableNode: Boolean(node),
    name: project.name,
    nodePackageManager: node?.packageManager || catalog.node?.packageManagers?.[0] || "npm",
    nodeVersion: node?.version || catalog.node?.defaultVersion || "24",
    phpExtensions: php?.extensions?.filter((extension) => !presetExtensions.has(extension)).join(",") || "",
    phpPreset: preset,
    phpVersion: php?.version || catalog.php?.defaultVersion || "8.4",
    webCommand: project.web.command || "npm run dev -- --host 0.0.0.0",
    webPort: String(project.web.proxyPort || 80),
    webStack: project.web.stack,
  };
}

export function defaultDocumentRoot(stack: ProjectWebStack) {
  if (stack === "nginx-fpm") return "public";
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
  if ((form.webStack === "apache" || form.webStack === "nginx-fpm") && !form.phpVersion.trim())
    return messages.phpVersion;
  if ((form.webStack === "node" || form.enableNode) && !form.nodeVersion.trim()) return messages.nodeVersion;
  return "";
}
