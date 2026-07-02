import type { AppText } from "../types";

export const enSettings = {
  clean: "Everything is saved",
  description: "Local values for commands, Docker Compose and UI defaults.",
  envGenerated: ".env generated from settings.json",
  eyebrow: "Runtime config",
  generateEnv: "Generate .env",
  loading: "Loading settings...",
  reset: "Reset",
  save: "Save",
  saved: "Settings saved",
  sectionEyebrow: "settings",
  sections: {
    pgadmin: "pgAdmin",
    phpmyadmin: "phpMyAdmin",
    rustfs: "RustFS",
    proxy: "Nginx Proxy Manager",
    redis: "Redis",
    registry: "Registry",
  },
  sourceLabel: "JSON file",
  sourceMissing: "will be created",
  sourceReady: "active",
  title: "Settings",
  unsaved: "Unsaved changes",
} satisfies AppText["settings"];
