import type { AppText } from "../types";

export const enUtilities = {
  archive: {
    archiveName: "Archive name",
    archiveNamePlaceholder: "project-backup",
    archiveSelect: "Archive",
    archiveSelectPlaceholder: "Choose archive",
    createAction: "Create archive",
    createTitle: "Archive",
    deleteAction: "Delete archive",
    deleteTitle: "Delete selected archive",
    dest: "Extract to",
    destPlaceholder: "restore/project",
    emptyArchives: "No archives found yet",
    extractAction: "Extract",
    extractTitle: "Extract",
    folder: "Folder",
    folderPlaceholder: "config",
    refresh: "Refresh list",
    title: "Archiver",
    titleEyebrow: "Utilities",
    validation: {
      archive: "Choose an archive from the list.",
      createDisabled: "Enter archive name and folder.",
      dest: "Enter destination folder.",
      folder: "Enter folder to archive.",
      name: "Use letters, numbers, dot, underscore or dash.",
    },
  },
  description: "Create project folder archives, extract selected archives and remove old ones.",
  eyebrow: "Utilities",
} satisfies AppText["utilities"];
