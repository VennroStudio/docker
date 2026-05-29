import type { AppText } from "../types";

export const ruUtilities = {
  archive: {
    archiveName: "Имя архива",
    archiveNamePlaceholder: "project-backup",
    archiveSelect: "Архив",
    archiveSelectPlaceholder: "Выбрать архив",
    createAction: "Создать архив",
    createTitle: "Архивирование",
    deleteAction: "Удалить архив",
    deleteTitle: "Удалить выбранный архив",
    dest: "Куда распаковать",
    destPlaceholder: "restore/project",
    emptyArchives: "Архивы пока не найдены",
    extractAction: "Распаковать",
    extractTitle: "Распаковка",
    folder: "Папка",
    folderPlaceholder: "config",
    refresh: "Обновить список",
    title: "Архиватор",
    titleEyebrow: "Utilities",
    validation: {
      archive: "Выбери архив из списка.",
      createDisabled: "Укажи имя архива и папку.",
      dest: "Укажи папку для распаковки.",
      folder: "Укажи папку, которую нужно архивировать.",
      name: "Используй буквы, цифры, точку, подчёркивание или дефис.",
    },
  },
  description: "Создавай архивы папок проекта, распаковывай выбранные архивы и удаляй лишнее.",
  eyebrow: "Utilities",
} satisfies AppText["utilities"];
