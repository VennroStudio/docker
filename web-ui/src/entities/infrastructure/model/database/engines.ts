import type { DatabaseEngine } from "../../api/database";
import type { MariaDbInstance, PostgresInstance } from "../types";
import type { DatabaseInstanceOption, InstanceLabel } from "./formTypes";

type DatabaseEngineConfig<Instance extends DatabaseInstanceOption> = {
  engine: DatabaseEngine;
  getSuggestedFilePath: (database: string) => string;
  instanceLabel: InstanceLabel<Instance>;
  isValidDatabaseName: (database: string) => boolean;
  isValidDumpPath: (filePath: string) => boolean;
};

const mariaDbDumpExtensions = [".sql", ".sql.gz"];
const postgresDumpExtensions = [...mariaDbDumpExtensions, ".dump"];

export const mariaDbDatabaseEngine = {
  engine: "mariadb",
  getSuggestedFilePath: (database) => `dumps/mariadb/${database}.sql.gz`,
  instanceLabel: (instance) => databaseInstanceLabel("MariaDB", instance),
  isValidDatabaseName: (database) => /^[A-Za-z0-9_$.-]+$/.test(database),
  isValidDumpPath: (filePath) => hasSupportedExtension(filePath, mariaDbDumpExtensions),
} satisfies DatabaseEngineConfig<MariaDbInstance>;

export const postgresDatabaseEngine = {
  engine: "postgres",
  getSuggestedFilePath: (database) => `dumps/postgres/${database}.dump`,
  instanceLabel: (instance) => databaseInstanceLabel("Postgres", instance),
  isValidDatabaseName: (database) => /^[A-Za-z0-9_]+$/.test(database),
  isValidDumpPath: (filePath) => hasSupportedExtension(filePath, postgresDumpExtensions),
} satisfies DatabaseEngineConfig<PostgresInstance>;

function databaseInstanceLabel(label: string, instance: DatabaseInstanceOption) {
  return `${label} ${instance.version} / ${instance.container} / :${instance.hostPort}`;
}

function hasSupportedExtension(filePath: string, extensions: string[]) {
  return extensions.some((extension) => filePath.endsWith(extension));
}
