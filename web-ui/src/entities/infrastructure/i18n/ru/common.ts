import type { AppText } from "../types";

export const ruCommon = {
  cancel: "Отмена",
  clear: "Очистить",
  containerActions: {
    clean: { label: "Clean", detail: "удалить образ" },
    down: { label: "Down", detail: "удалить контейнер" },
    logs: { label: "Logs", detail: "поток логов" },
    shell: { label: "Shell", detail: "make shell" },
    start: { label: "Start", detail: "запустить контейнер" },
    stop: { label: "Stop", detail: "остановить сервис" },
    up: { label: "Up", detail: "docker compose up" },
  },
  hide: "Скрыть",
  link: "Ссылка",
  panel: "панель",
  panels: "панелей",
  statusLabels: {
    missing: "нет",
    partial: "частично",
    running: "запущен",
    stopped: "остановлен",
    unknown: "неизвестно",
  },
  stop: "Стоп",
  terminalStateLabels: {
    done: "готово",
    error: "ошибка",
    ready: "готов",
    running: "выполняется",
    stopped: "остановлено",
  },
  terminal: "Терминал",
} satisfies AppText["common"];
