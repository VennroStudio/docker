import {
  DatabaseDumpImportForm,
  type AppText,
  type PostgresImportForm,
  type PostgresInstance,
} from "@/entities/infrastructure";
import { fetchPostgresDatabases } from "../api/databases";
import { fetchPostgresDumps, type PostgresDumpFile } from "../api/dumps";

type PostgresImportBlockProps = {
  copy: AppText["postgresInstances"]["import"];
  databaseRefreshSignal?: number;
  defaultDatabase?: string;
  defaultFilePath?: string;
  disabled?: boolean;
  disabledTitle?: string;
  instances: PostgresInstance[];
  loading?: boolean;
  onImport: (form: PostgresImportForm) => void;
};

export function PostgresImportBlock(props: PostgresImportBlockProps) {
  return (
    <DatabaseDumpImportForm<PostgresInstance, PostgresImportForm, PostgresDumpFile>
      {...props}
      fetchDatabases={fetchPostgresDatabases}
      fetchDumpFiles={fetchPostgresDumps}
      instanceLabel={instanceLabel}
      isValidDatabaseName={isValidDatabaseName}
      isValidDumpPath={isSupportedDumpPath}
    />
  );
}

function isSupportedDumpPath(filePath: string) {
  return filePath.endsWith(".sql") || filePath.endsWith(".sql.gz") || filePath.endsWith(".dump");
}

function isValidDatabaseName(database: string) {
  return /^[A-Za-z0-9_]+$/.test(database);
}

function instanceLabel(instance: PostgresInstance) {
  return `Postgres ${instance.version} / ${instance.container} / :${instance.hostPort}`;
}
