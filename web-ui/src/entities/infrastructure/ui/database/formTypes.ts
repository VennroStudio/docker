import type { AppText } from "../../i18n/types";

export type DatabaseInstanceOption = {
  container: string;
  hostPort: number;
  version: string;
};

export type DatabaseDumpFile = {
  path: string;
};

export type DatabaseDumpForm = {
  container: string;
  database: string;
  filePath: string;
};

export type DatabaseCatalogForm = {
  container: string;
  database: string;
};

export type DatabaseImportCopy = AppText["mariadbInstances"]["import"] | AppText["postgresInstances"]["import"];
export type DatabaseExportCopy = AppText["mariadbInstances"]["export"] | AppText["postgresInstances"]["export"];
export type DatabaseCatalogCopy =
  | AppText["mariadbInstances"]["databaseManager"]
  | AppText["postgresInstances"]["databaseManager"];

export type FetchDatabases = (container: string) => Promise<string[]>;
export type FetchDumpFiles<File extends DatabaseDumpFile> = () => Promise<File[]>;
export type InstanceLabel<Instance extends DatabaseInstanceOption> = (instance: Instance) => string;
