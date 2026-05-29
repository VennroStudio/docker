import type { AppText } from "../types";

export const enServicePages = {
  mariadb: {
    description: "Manage MariaDB, PostgreSQL, phpMyAdmin and pgAdmin on one page.",
    eyebrow: "SQL stack",
    panelEyebrow: "Database",
    panelTitle: "Databases",
  },
  minio: {
    description: "Manage MinIO storage and stream service logs.",
    eyebrow: "Storage",
    panelEyebrow: "S3 storage",
    panelTitle: "MinIO commands",
  },
  nginx: {
    description: "Manage the NPM container lifecycle and stream proxy manager logs.",
    eyebrow: "Nginx Proxy Manager",
    panelEyebrow: "Proxy manager",
    panelTitle: "NPM commands",
  },
  postgres: {
    description: "Manage PostgreSQL and pgAdmin containers.",
    eyebrow: "Database",
    panelEyebrow: "Database",
    panelTitle: "Postgres commands",
  },
  proxy: {
    description: "Create local host records and manage proxy hosts and the NPM container.",
    eyebrow: "Nginx Proxy Manager",
    panelEyebrow: "Proxy host",
    panelTitle: "Routing and NPM",
  },
  redis: {
    description: "Manage Redis and RedisInsight containers.",
    eyebrow: "Cache",
    panelEyebrow: "Cache",
    panelTitle: "Redis commands",
  },
  registry: {
    description: "Manage the private registry, UI and live logs.",
    eyebrow: "Docker registry",
    panelEyebrow: "Registry",
    panelTitle: "Registry commands",
  },
  utilities: {
    description: "Local project tools.",
    eyebrow: "Utilities",
    panelEyebrow: "Utilities",
    panelTitle: "Utilities",
  },
} satisfies AppText["servicePages"];
