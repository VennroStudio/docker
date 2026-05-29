import type { AppText } from "../types";

export const enPanels = {
  npm: {
    configEyebrow: "Settings",
    configTitle: "Config",
    nginxEyebrow: "NPM container",
    nginxTitle: "Nginx management",
  },
  serviceControl: {
    adminPanel: "Admin panel",
    cache: "Cache service",
    database: "Database",
    interface: "Interface",
  },
  proxy: {
    addHost: "Add host",
    createProxy: "Create proxy",
    deleteProxy: "Delete proxy",
    domain: "Domain",
    eyebrow: "Proxy host",
    hints: {
      domain: "For example: app.local or pma.local",
      port: "1-65535",
      target: "Docker container or service name",
    },
    removeHost: "Remove from host",
    target: "Target container",
    title: "Domain routing",
    validation: {
      domain: "Use only letters, numbers, dots and hyphens.",
      hostDisabled: "Enter a valid domain first.",
      port: "Port must be an integer from 1 to 65535.",
      proxyDisabled: "Fill in domain, target container and port.",
      target: "Target can contain letters, numbers, dot, underscore and hyphen.",
    },
  },
} satisfies AppText["panels"];
