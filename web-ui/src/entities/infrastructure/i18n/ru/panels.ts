import type { AppText } from "../types";

export const ruPanels = {
  npm: {
    configEyebrow: "Settings",
    configTitle: "Конфиг",
    nginxEyebrow: "NPM container",
    nginxTitle: "Управление Nginx",
  },
  serviceControl: {
    adminPanel: "Панель администрирования",
    auth: "Доступ",
    cache: "Cache service",
    containerRequired: "Сначала подними контейнер.",
    database: "База данных",
    interface: "Интерфейс",
    mariadbRequired: "Сначала запусти MariaDB.",
    minioCredentialsRequired: "Сначала заполни MinIO root user и MinIO root password.",
    port: "Порт",
    pgadminCredentialsRequired: "Сначала заполни pgAdmin email и pgAdmin password.",
    postgresRequired: "Сначала запусти PostgreSQL.",
    redisPasswordRequired: "Сначала заполни Redis password.",
    redisRequired: "Сначала запусти Redis.",
    registryCredentialsRequired: "Сначала заполни Registry user и Registry password.",
    registryRequired: "Сначала запусти Registry.",
  },
  proxy: {
    addHost: "Добавить host",
    createProxy: "Создать proxy",
    deleteProxy: "Удалить proxy",
    domain: "Домен",
    eyebrow: "Proxy host",
    hints: {
      domain: "Например: app.local или pma.local",
      port: "1-65535",
      target: "Имя Docker container или service name",
    },
    removeHost: "Удалить из host",
    target: "Target container",
    title: "Маршрутизация домена",
    validation: {
      domain: "Используй только буквы, цифры, точки и дефисы.",
      hostDisabled: "Сначала укажи корректный домен.",
      port: "Порт должен быть целым числом от 1 до 65535.",
      proxyDisabled: "Заполни домен, target container и порт.",
      target: "Target может содержать буквы, цифры, точку, подчёркивание и дефис.",
    },
  },
} satisfies AppText["panels"];
