import type { AppText } from "../types";

export const ruOperationToast = {
  blocked: (label) => `Дождись завершения: ${label}`,
  error: (label) => `${label}: завершилось с ошибкой`,
  stopped: (label) => `${label}: остановлено`,
  success: (label) => `${label}: выполнено`,
} satisfies AppText["operationToast"];
