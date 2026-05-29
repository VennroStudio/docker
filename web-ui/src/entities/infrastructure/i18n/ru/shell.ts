import type { AppText } from "../types";

export const ruShell = {
  detail: (container) => `make shell: ${container}`,
  inputPlaceholder: "Введи команду внутри контейнера и нажми Enter",
  openLabel: (label) => `${label} shell`,
  panelEyebrow: "Интерактивный доступ",
  panelTitle: "Shell внутри контейнера",
} satisfies AppText["shell"];
