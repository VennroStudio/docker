import type { CommandAction } from "@/entities/infrastructure";
import { commandPreview, streamCommand } from "@/features/command-terminal";
import type { ConfirmDialogApi, OperationTextConfig, RunWithTerminal } from "./operationTypes";

type UseCommandOperationsConfig = OperationTextConfig & {
  confirmDialog: ConfirmDialogApi;
  refreshNginxStatus: () => Promise<void> | void;
  runWithTerminal: RunWithTerminal;
};

export function useCommandOperations({
  confirmDialog,
  refreshNginxStatus,
  runWithTerminal,
  text,
}: UseCommandOperationsConfig) {
  const runCommand = async (action: CommandAction) => {
    if (action.confirm) {
      const confirmed = await confirmDialog.confirm({
        body: text.confirm.runCommand.body(commandPreview(action.id)),
        cancelLabel: text.common.cancel,
        confirmLabel: text.confirm.runCommand.confirmLabel,
        title: action.label,
        tone: "danger",
      });
      if (!confirmed) return;
    }

    runWithTerminal({
      key: action.id,
      label: action.label,
      onSettled: action.id.startsWith("npm:") ? refreshNginxStatus : undefined,
      open: (handlers) => streamCommand(action.id, handlers),
      preview: commandPreview(action.id),
    });
  };

  return { runCommand };
}
