import type {
  AppText,
  MariaDbDatabaseForm,
  MariaDbExportForm,
  MariaDbImportForm,
  MariaDbInstance,
  MariaDbInstanceAction,
  MariaDbInstanceForm,
} from "@/entities/infrastructure";
import {
  openMariaDbDatabaseTerminal,
  openMariaDbExportTerminal,
  openMariaDbImportTerminal,
  openMariaDbInstanceActionTerminal,
  openMariaDbInstanceCreateTerminal,
  openShellTerminal,
} from "@/features/command-terminal";
import type { ConfirmDialogApi, RunWithTerminal } from "./operationTypes";

type UseMariaDbOperationsConfig = {
  confirmDialog: ConfirmDialogApi;
  refreshDatabaseCatalog: () => void;
  refreshMariaDbInstances: () => void;
  runWithTerminal: RunWithTerminal;
  text: AppText;
};

export function useMariaDbOperations({
  confirmDialog,
  refreshDatabaseCatalog,
  refreshMariaDbInstances,
  runWithTerminal,
  text,
}: UseMariaDbOperationsConfig) {
  const runMariaDbInstanceCreate = (form: MariaDbInstanceForm) => {
    runWithTerminal({
      key: "mariadb:create",
      label: text.mariadbInstances.create,
      onSettled: refreshMariaDbInstances,
      open: (handlers) => openMariaDbInstanceCreateTerminal(form, handlers),
      preview: `make mariadb-instance-add VERSION=${form.version} DB_USER=${form.user} PASSWORD=******** ROOT_PASSWORD=********`,
    });
  };

  const runMariaDbImport = (form: MariaDbImportForm) => {
    runWithTerminal({
      key: "mariadb:import",
      label: text.mariadbInstances.import.action,
      onSettled: refreshMariaDbInstances,
      open: (handlers) => openMariaDbImportTerminal(form, handlers),
      preview: `make mariadb-import CONTAINER=${form.container} DATABASE=${form.database} DUMP_FILE=${form.filePath}`,
    });
  };

  const runMariaDbExport = (form: MariaDbExportForm) => {
    runWithTerminal({
      key: "mariadb:export",
      label: text.mariadbInstances.export.action,
      onSettled: refreshMariaDbInstances,
      open: (handlers) => openMariaDbExportTerminal(form, handlers),
      preview: `make mariadb-export CONTAINER=${form.container} DATABASE=${form.database} DUMP_FILE=${form.filePath}`,
    });
  };

  const runMariaDbDatabaseCreate = (form: MariaDbDatabaseForm) => {
    runWithTerminal({
      key: "mariadb:database:create",
      label: text.mariadbInstances.databaseManager.createAction,
      onSettled: refreshDatabaseCatalog,
      open: (handlers) => openMariaDbDatabaseTerminal(form, "create", handlers),
      preview: `make mariadb-db-create CONTAINER=${form.container} DATABASE=${form.database}`,
    });
  };

  const runMariaDbDatabaseDrop = async (form: MariaDbDatabaseForm) => {
    const confirmed = await confirmDialog.confirm({
      body: text.confirm.runCommand.body(`drop MariaDB database ${form.database} on ${form.container}`),
      cancelLabel: text.common.cancel,
      confirmLabel: text.confirm.runCommand.confirmLabel,
      title: text.mariadbInstances.databaseManager.deleteAction,
      tone: "danger",
    });
    if (!confirmed) return;

    runWithTerminal({
      key: "mariadb:database:drop",
      label: text.mariadbInstances.databaseManager.deleteAction,
      onSettled: refreshDatabaseCatalog,
      open: (handlers) => openMariaDbDatabaseTerminal(form, "drop", handlers),
      preview: `make mariadb-db-drop CONTAINER=${form.container} DATABASE=${form.database}`,
    });
  };

  const runMariaDbInstanceAction = async (instance: MariaDbInstance, action: MariaDbInstanceAction) => {
    if (action === "clean" || action === "down" || action === "stop") {
      const confirmed = await confirmDialog.confirm({
        body: text.confirm.runCommand.body(`mariadb instance ${action}: ${instance.name}`),
        cancelLabel: text.common.cancel,
        confirmLabel: text.confirm.runCommand.confirmLabel,
        title: text.mariadbInstances.actions[action].label,
        tone: "danger",
      });
      if (!confirmed) return;
    }

    runWithTerminal({
      key: `mariadb:${instance.name}:${action}`,
      label: text.mariadbInstances.actions[action].label,
      onSettled: refreshMariaDbInstances,
      open: (handlers) => openMariaDbInstanceActionTerminal(instance.name, action, handlers),
      preview: `make mariadb-instance-${action} NAME=${instance.name}`,
    });
  };

  const runMariaDbInstanceShell = (instance: MariaDbInstance) => {
    runWithTerminal({
      key: `shell:${instance.container}`,
      label: text.mariadbInstances.actions.shell.label,
      open: (handlers) => openShellTerminal(instance.container, handlers),
      preview: `make mariadb-instance-shell NAME=${instance.name}`,
    });
  };

  return {
    runMariaDbDatabaseCreate,
    runMariaDbDatabaseDrop,
    runMariaDbExport,
    runMariaDbImport,
    runMariaDbInstanceAction,
    runMariaDbInstanceCreate,
    runMariaDbInstanceShell,
  };
}
