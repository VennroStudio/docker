import {
  DatabaseDumpExportForm,
  type AppText,
  type PostgresExportForm,
  type PostgresInstance,
} from "@/entities/infrastructure";
import { fetchPostgresDatabases } from "../api/databases";

type PostgresExportBlockProps = {
  copy: AppText["postgresInstances"]["export"];
  databaseRefreshSignal?: number;
  defaultDatabase?: string;
  defaultFilePath?: string;
  disabled?: boolean;
  disabledTitle?: string;
  instances: PostgresInstance[];
  loading?: boolean;
  onExport: (form: PostgresExportForm) => void;
};

export function PostgresExportBlock(props: PostgresExportBlockProps) {
  return (
    <DatabaseDumpExportForm<PostgresInstance, PostgresExportForm>
      {...props}
      fetchDatabases={fetchPostgresDatabases}
      getSuggestedFilePath={(database) => `dumps/postgres/${database}.dump`}
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
