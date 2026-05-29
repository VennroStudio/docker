import type { AppText } from "../types";

export const enShell = {
  detail: (container) => `make shell: ${container}`,
  inputPlaceholder: "Type a command inside the container and press Enter",
  openLabel: (label) => `${label} shell`,
  panelEyebrow: "Interactive access",
  panelTitle: "Container shell",
} satisfies AppText["shell"];
