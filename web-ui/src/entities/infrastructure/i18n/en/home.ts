import type { AppText } from "../types";

export const enHome = {
  hero: {
    eyebrow: "Infrastructure",
    lead: "Manage local domains, databases, storage, cache, registry and SSH from one control panel.",
    title: "Control panel",
  },
  serviceCards: {
    mariadb: {
      description: "MariaDB, Postgres and UI database management.",
      meta: "Data module",
      title: "Databases",
    },
    minio: {
      description: "S3-compatible storage with console access.",
      meta: "Storage module",
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
      description: "Domain, SSL and NPM container management.",
      meta: "NPM module",
      title: "Nginx Proxy Manager",
    },
    projects: {
      description: "Local Docker websites with Apache, nginx + PHP-FPM, or Node.",
      meta: "Web module",
      title: "Projects",
    },
    redis: {
      description: "Redis and UI cache management.",
      meta: "Cache module",
      title: "Cache",
    },
    registry: {
      description: "Registry and UI image management.",
      meta: "Images module",
      title: "Private Docker Registry",
    },
    ssh: {
      description: "Store SSH servers, connect through the terminal and manage RSA keys.",
      meta: "SSH service",
      title: "SSH Control Panel",
    },
  },
  modules: {
    eyebrow: "Module panel",
    title: "Module management",
  },
  services: {
    eyebrow: "Service panel",
    title: "Service management",
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
