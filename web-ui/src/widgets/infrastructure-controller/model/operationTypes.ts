import type { AppText } from "@/entities/infrastructure";
import type { useConfirmDialog, useToast } from "@/shared/lib/hooks";
import type { RunWithTerminalConfig } from "./useTerminalOperations";

export type ConfirmDialogApi = Pick<ReturnType<typeof useConfirmDialog>, "confirm">;
export type RunWithTerminal = (config: RunWithTerminalConfig) => void;
export type ToastApi = Pick<ReturnType<typeof useToast>, "show">;

export type OperationTextConfig = {
  text: AppText;
};
