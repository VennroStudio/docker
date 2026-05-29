import type { AppText } from "../types";

export const enOperationToast = {
  blocked: (label) => `Wait until this finishes: ${label}`,
  error: (label) => `${label}: failed`,
  stopped: (label) => `${label}: stopped`,
  success: (label) => `${label}: completed`,
} satisfies AppText["operationToast"];
