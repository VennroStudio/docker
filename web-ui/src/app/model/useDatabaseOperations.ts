import type {
  AppText,
  MariaDbDatabaseForm,
  MariaDbExportForm,
  MariaDbImportForm,
  MariaDbInstance,
  MariaDbInstanceAction,
  MariaDbInstanceForm,
  PostgresDatabaseForm,
  PostgresExportForm,
  PostgresImportForm,
  PostgresInstance,
  PostgresInstanceAction,
  PostgresInstanceForm,
} from "@/entities/infrastructure";
import {
  streamMariaDbDatabase,
  streamMariaDbExport,
  streamMariaDbImport,
  streamMariaDbInstanceAction,
  streamMariaDbInstanceCreate,
  streamPostgresDatabase,
  streamPostgresExport,
  streamPostgresImport,
  streamPostgresInstanceAction,
  streamPostgresInstanceCreate,
  streamShell,
} from "@/features/command-terminal";
import type { useConfirmDialog } from "@/shared/lib/hooks";
import type { RunWithTerminalConfig } from "./useTerminalOperations";

type ConfirmDialogApi = Pick<ReturnType<typeof useConfirmDialog>, "confirm">;
type RunWithTerminal = (config: RunWithTerminalConfig) => void;

type UseDatabaseOperationsConfig = {
  confirmDialog: ConfirmDialogApi;
  refreshDatabaseCatalog: () => void;
  refreshMariaDbInstances: () => void;
  refreshPostgresInstances: () => void;
  runWithTerminal: RunWithTerminal;
  text: AppText;
};

export function useDatabaseOperations({
  confirmDialog,
  refreshDatabaseCatalog,
  refreshMariaDbInstances,
  refreshPostgresInstances,
  runWithTerminal,
  text,
}: UseDatabaseOperationsConfig) {
  const runMariaDbInstanceCreate = (form: MariaDbInstanceForm) => {
    runWithTerminal({
      key: "mariadb:create",
      label: text.mariadbInstances.create,
      onSettled: refreshMariaDbInstances,
      open: (handlers) => streamMariaDbInstanceCreate(form, handlers),
      preview: `make mariadb-instance-add VERSION=${form.version} DB_USER=${form.user} PASSWORD=******** ROOT_PASSWORD=********`,
    });
  };

  const runMariaDbImport = (form: MariaDbImportForm) => {
    runWithTerminal({
      key: "mariadb:import",
      label: text.mariadbInstances.import.action,
      onSettled: refreshMariaDbInstances,
      open: (handlers) => streamMariaDbImport(form, handlers),
      preview: `make mariadb-import CONTAINER=${form.container} DATABASE=${form.database} DUMP_FILE=${form.filePath}`,
    });
  };

  const runMariaDbExport = (form: MariaDbExportForm) => {
    runWithTerminal({
      key: "mariadb:export",
      label: text.mariadbInstances.export.action,
      onSettled: refreshMariaDbInstances,
      open: (handlers) => streamMariaDbExport(form, handlers),
      preview: `make mariadb-export CONTAINER=${form.container} DATABASE=${form.database} DUMP_FILE=${form.filePath}`,
    });
  };

  const runMariaDbDatabaseCreate = (form: MariaDbDatabaseForm) => {
    runWithTerminal({
      key: "mariadb:database:create",
      label: text.mariadbInstances.databaseManager.createAction,
      onSettled: refreshDatabaseCatalog,
      open: (handlers) => streamMariaDbDatabase(form, "create", handlers),
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
      open: (handlers) => streamMariaDbDatabase(form, "drop", handlers),
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
      open: (handlers) => streamMariaDbInstanceAction(instance.name, action, handlers),
      preview: `make mariadb-instance-${action} NAME=${instance.name}`,
    });
  };

  const runMariaDbInstanceShell = (instance: MariaDbInstance) => {
    runWithTerminal({
      key: `shell:${instance.container}`,
      label: text.mariadbInstances.actions.shell.label,
      open: (handlers) => streamShell(instance.container, handlers),
      preview: `make mariadb-instance-shell NAME=${instance.name}`,
    });
  };

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
    runMariaDbDatabaseCreate,
    runMariaDbDatabaseDrop,
    runMariaDbExport,
    runMariaDbImport,
    runMariaDbInstanceAction,
    runMariaDbInstanceCreate,
    runMariaDbInstanceShell,
    runPostgresDatabaseCreate,
    runPostgresDatabaseDrop,
    runPostgresExport,
    runPostgresImport,
    runPostgresInstanceAction,
    runPostgresInstanceCreate,
    runPostgresInstanceShell,
  };
}
