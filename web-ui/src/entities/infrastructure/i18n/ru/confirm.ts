import type { AppText } from "../types";

export const ruConfirm = {
  deleteHost: {
    body: (domain) => `${domain} будет удален из /etc/hosts.`,
    confirmLabel: "Удалить host",
    title: "Удалить локальный host",
  },
  deleteProxy: {
    body: (domain) => `${domain} будет удален из Nginx Proxy Manager. SSL-сертификат в NPM тоже будет удален.`,
    confirmLabel: "Удалить proxy",
    title: "Удалить proxy host",
  },
  runCommand: {
    body: (command) => `${command} будет выполнена в локальном Docker окружении.`,
    confirmLabel: "Запустить",
  },
} satisfies AppText["confirm"];
