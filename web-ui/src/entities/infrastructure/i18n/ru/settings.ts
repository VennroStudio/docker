import type { AppText } from "../types";

export const ruSettings = {
  clean: "Все сохранено",
  description: "Локальные значения для команд, Docker Compose и UI по умолчанию.",
  envGenerated: ".env сгенерирован из settings.json",
  eyebrow: "Runtime config",
  generateEnv: "Сгенерировать .env",
  loading: "Загрузка настроек...",
  reset: "Сбросить",
  save: "Сохранить",
  saved: "Настройки сохранены",
  sectionEyebrow: "settings",
  sections: {
    pgadmin: "pgAdmin",
    phpmyadmin: "phpMyAdmin",
    rustfs: "RustFS",
    proxy: "Nginx Proxy Manager",
    redis: "Redis",
    registry: "Registry",
  },
  sourceLabel: "JSON файл",
  sourceMissing: "будет создан",
  sourceReady: "активен",
  title: "Настройки",
  unsaved: "Есть несохраненные изменения",
} satisfies AppText["settings"];
