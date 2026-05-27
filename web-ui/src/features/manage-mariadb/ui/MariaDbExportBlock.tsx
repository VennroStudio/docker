import {
  DatabaseDumpExportForm,
  type AppText,
  type MariaDbExportForm,
  type MariaDbInstance,
} from "@/entities/infrastructure";
import { fetchMariaDbDatabases } from "../api/databases";

type MariaDbExportBlockProps = {
  copy: AppText["mariadbInstances"]["export"];
  databaseRefreshSignal?: number;
  defaultDatabase?: string;
  defaultFilePath?: string;
  disabled?: boolean;
  disabledTitle?: string;
  instances: MariaDbInstance[];
  loading?: boolean;
  onExport: (form: MariaDbExportForm) => void;
};

export function MariaDbExportBlock(props: MariaDbExportBlockProps) {
  return (
    <DatabaseDumpExportForm<MariaDbInstance, MariaDbExportForm>
      {...props}
      fetchDatabases={fetchMariaDbDatabases}
      getSuggestedFilePath={(database) => `dumps/mariadb/${database}.sql.gz`}
      instanceLabel={instanceLabel}
      isValidDatabaseName={isValidDatabaseName}
      isValidDumpPath={isSupportedDumpPath}
    />
  );
}

function isSupportedDumpPath(filePath: string) {
  return filePath.endsWith(".sql") || filePath.endsWith(".sql.gz");
}

function isValidDatabaseName(database: string) {
  return /^[A-Za-z0-9_$.-]+$/.test(database);
}

function instanceLabel(instance: MariaDbInstance) {
  return `MariaDB ${instance.version} / ${instance.container} / :${instance.hostPort}`;
}
