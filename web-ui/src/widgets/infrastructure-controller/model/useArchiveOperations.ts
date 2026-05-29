import type { ArchiveCreateForm, ArchiveExtractForm } from "@/entities/infrastructure";
import {
  archiveCreatePreview,
  archiveDeletePreview,
  archiveExtractPreview,
  streamArchiveCreate,
  streamArchiveDelete,
  streamArchiveExtract,
} from "@/features/command-terminal";
import type { ConfirmDialogApi, OperationTextConfig, RunWithTerminal } from "./operationTypes";

type UseArchiveOperationsConfig = OperationTextConfig & {
  confirmDialog: ConfirmDialogApi;
  refreshArchives: () => void;
  runWithTerminal: RunWithTerminal;
};

export function useArchiveOperations({
  confirmDialog,
  refreshArchives,
  runWithTerminal,
  text,
}: UseArchiveOperationsConfig) {
  const runArchiveCreate = (form: ArchiveCreateForm) => {
    runWithTerminal({
      key: "archive:create",
      label: text.utilities.archive.createAction,
      onSettled: refreshArchives,
      open: (handlers) => streamArchiveCreate(form, handlers),
      preview: archiveCreatePreview(form),
    });
  };

  const runArchiveExtract = (form: ArchiveExtractForm) => {
    runWithTerminal({
      key: "archive:extract",
      label: text.utilities.archive.extractAction,
      open: (handlers) => streamArchiveExtract(form, handlers),
      preview: archiveExtractPreview(form),
    });
  };

  const runArchiveDelete = async (name: string) => {
    const confirmed = await confirmDialog.confirm({
      body: text.confirm.runCommand.body(archiveDeletePreview(name)),
      cancelLabel: text.common.cancel,
      confirmLabel: text.confirm.runCommand.confirmLabel,
      title: text.utilities.archive.deleteTitle,
      tone: "danger",
    });
    if (!confirmed) return;

    runWithTerminal({
      key: "archive:delete",
      label: text.utilities.archive.deleteAction,
      onSettled: refreshArchives,
      open: (handlers) => streamArchiveDelete(name, handlers),
      preview: archiveDeletePreview(name),
    });
  };

  return {
    runArchiveCreate,
    runArchiveDelete,
    runArchiveExtract,
  };
}
