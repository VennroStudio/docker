import type {
  AppText,
  PostgresDatabaseForm,
  PostgresExportForm,
  PostgresImportForm,
  PostgresInstance,
  PostgresInstanceAction,
  PostgresInstanceForm,
} from "@/entities/infrastructure";
import {
  streamPostgresDatabase,
  streamPostgresExport,
  streamPostgresImport,
  streamPostgresInstanceAction,
  streamPostgresInstanceCreate,
  streamShell,
} from "@/features/command-terminal";
import type { ConfirmDialogApi, RunWithTerminal } from "./operationTypes";

type UsePostgresOperationsConfig = {
  confirmDialog: ConfirmDialogApi;
  refreshDatabaseCatalog: () => void;
  refreshPostgresInstances: () => void;
  runWithTerminal: RunWithTerminal;
  text: AppText;
};

export function usePostgresOperations({
  confirmDialog,
  refreshDatabaseCatalog,
  refreshPostgresInstances,
  runWithTerminal,
  text,
}: UsePostgresOperationsConfig) {
  const runPostgresInstanceCreate = (form: PostgresInstanceForm) => {
    runWithTerminal({
      key: "postgres:create",
      label: text.postgresInstances.create,
      onSettled: refreshPostgresInstances,
      open: (handlers) => streamPostgresInstanceCreate(form, handlers),
      preview: `make postgres-instance-add VERSION=${form.version} DB_USER=${form.user} PASSWORD=******** DATABASE=${form.database}`,
    });
  };

  const runPostgresImport = (form: PostgresImportForm) => {
    runWithTerminal({
      key: "postgres:import",
      label: text.postgresInstances.import.action,
      onSettled: refreshPostgresInstances,
      open: (handlers) => streamPostgresImport(form, handlers),
      preview: `make postgres-import CONTAINER=${form.container} POSTGRES_DB=${form.database} DUMP_FILE=${form.filePath}`,
    });
  };

  const runPostgresExport = (form: PostgresExportForm) => {
    runWithTerminal({
      key: "postgres:export",
      label: text.postgresInstances.export.action,
      onSettled: refreshPostgresInstances,
      open: (handlers) => streamPostgresExport(form, handlers),
      preview: `make postgres-export CONTAINER=${form.container} POSTGRES_DB=${form.database} DUMP_FILE=${form.filePath}`,
    });
  };

  const runPostgresDatabaseCreate = (form: PostgresDatabaseForm) => {
    runWithTerminal({
      key: "postgres:database:create",
      label: text.postgresInstances.databaseManager.createAction,
      onSettled: refreshDatabaseCatalog,
      open: (handlers) => streamPostgresDatabase(form, "create", handlers),
      preview: `make postgres-db-create CONTAINER=${form.container} DATABASE=${form.database}`,
    });
  };

  const runPostgresDatabaseDrop = async (form: PostgresDatabaseForm) => {
    const confirmed = await confirmDialog.confirm({
      body: text.confirm.runCommand.body(`drop Postgres database ${form.database} on ${form.container}`),
      cancelLabel: text.common.cancel,
      confirmLabel: text.confirm.runCommand.confirmLabel,
      title: text.postgresInstances.databaseManager.deleteAction,
      tone: "danger",
    });
    if (!confirmed) return;

    runWithTerminal({
      key: "postgres:database:drop",
      label: text.postgresInstances.databaseManager.deleteAction,
      onSettled: refreshDatabaseCatalog,
      open: (handlers) => streamPostgresDatabase(form, "drop", handlers),
      preview: `make postgres-db-drop CONTAINER=${form.container} DATABASE=${form.database}`,
    });
  };

  const runPostgresInstanceAction = async (instance: PostgresInstance, action: PostgresInstanceAction) => {
    if (action === "clean" || action === "down" || action === "stop") {
      const confirmed = await confirmDialog.confirm({
        body: text.confirm.runCommand.body(`postgres instance ${action}: ${instance.name}`),
        cancelLabel: text.common.cancel,
        confirmLabel: text.confirm.runCommand.confirmLabel,
        title: text.mariadbInstances.actions[action].label,
        tone: "danger",
      });
      if (!confirmed) return;
    }

    runWithTerminal({
      key: `postgres:${instance.name}:${action}`,
      label: text.mariadbInstances.actions[action].label,
      onSettled: refreshPostgresInstances,
      open: (handlers) => streamPostgresInstanceAction(instance.name, action, handlers),
      preview: `make postgres-instance-${action} NAME=${instance.name}`,
    });
  };

  const runPostgresInstanceShell = (instance: PostgresInstance) => {
    runWithTerminal({
      key: `shell:${instance.container}`,
      label: text.mariadbInstances.actions.shell.label,
      open: (handlers) => streamShell(instance.container, handlers),
      preview: `make postgres-instance-shell NAME=${instance.name}`,
    });
  };

  return {
    runPostgresDatabaseCreate,
    runPostgresDatabaseDrop,
    runPostgresExport,
    runPostgresImport,
    runPostgresInstanceAction,
    runPostgresInstanceCreate,
    runPostgresInstanceShell,
  };
}
