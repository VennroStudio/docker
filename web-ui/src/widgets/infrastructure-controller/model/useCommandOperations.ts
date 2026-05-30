import type { CommandAction } from "@/entities/infrastructure";
import { commandPreview, openCommandTerminal } from "@/features/command-terminal";
import type { ConfirmDialogApi, OperationTextConfig, RunWithTerminal, ToastApi } from "./operationTypes";

type UseCommandOperationsConfig = OperationTextConfig & {
  confirmDialog: ConfirmDialogApi;
  refreshNginxStatus: () => Promise<void> | void;
  runWithTerminal: RunWithTerminal;
  toast: ToastApi;
};

export function useCommandOperations({
  confirmDialog,
  refreshNginxStatus,
  runWithTerminal,
  text,
  toast,
}: UseCommandOperationsConfig) {
  const runCommand = async (action: CommandAction) => {
    if (action.blockedTitle) {
      toast.show({ title: action.blockedTitle, tone: "info" });
      return;
    }

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
      open: (handlers) => openCommandTerminal(action.id, handlers),
      preview: commandPreview(action.id),
    });
  };

  return { runCommand };
}
