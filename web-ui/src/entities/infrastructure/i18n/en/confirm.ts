import type { AppText } from "../types";

export const enConfirm = {
  deleteHost: {
    body: (domain) => `${domain} will be removed from /etc/hosts.`,
    confirmLabel: "Remove host",
    title: "Remove local host",
  },
  deleteProxy: {
    body: (domain) =>
      `${domain} will be removed from Nginx Proxy Manager. Its SSL certificate in NPM will be deleted too.`,
    confirmLabel: "Delete proxy",
    title: "Delete proxy host",
  },
  runCommand: {
    body: (command) => `${command} will be executed on your local Docker environment.`,
    confirmLabel: "Run",
  },
} satisfies AppText["confirm"];
