import type { AppText } from "../types";

export const enHome = {
  hero: {
    action: "Configure domain",
    eyebrow: "Local Infrastructure",
    lead: "Manage local domains, Nginx Proxy Manager, databases, storage and logs from one dark, focused workspace.",
    title: "Open-server control panel for Docker services.",
  },
  serviceCards: {
    mariadb: {
      description: "MariaDB, PostgreSQL, phpMyAdmin and pgAdmin in one workspace.",
      meta: "SQL stack",
      title: "Databases",
    },
    minio: {
      description: "S3-compatible storage with console access.",
      meta: "Storage",
      title: "MinIO",
    },
    nginx: {
      description: "Container lifecycle, proxy logs and NPM dashboard access.",
      meta: "Port 81",
      title: "Nginx Proxy Manager",
    },
    postgres: {
      description: "PostgreSQL and pgAdmin service commands.",
      meta: "DB tools",
      title: "Postgres",
    },
    proxy: {
      description: "Domains, proxy hosts and the NPM container.",
      meta: "NPM module",
      title: "Nginx Proxy Manager",
    },
    redis: {
      description: "Cache service, RedisInsight and live logs.",
      meta: "Cache",
      title: "Redis",
    },
    registry: {
      description: "Private Docker Registry, UI and image logs.",
      meta: "Images",
      title: "Registry",
    },
  },
  services: {
    eyebrow: "Service panels",
    title: "Run every service separately",
  },
  workflow: {
    eyebrow: "Local flow",
    steps: [
      {
        title: "Start only what you need",
        detail: "Each service has its own up, start, stop, down, clean and logs commands.",
      },
      {
        title: "Route a local domain",
        detail: "Add /etc/hosts entry, create NPM proxy host, optionally attach SSL.",
      },
    ],
    title: "Recommended order",
  },
} satisfies AppText["home"];
