import type { AppText } from "../types";

export const ruCommon = {
  cancel: "Отмена",
  clear: "Очистить",
  hide: "Скрыть",
  link: "Ссылка",
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
