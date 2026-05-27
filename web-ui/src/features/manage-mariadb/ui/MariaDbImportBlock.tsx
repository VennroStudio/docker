import {
  DatabaseDumpImportForm,
  type AppText,
  type MariaDbImportForm,
  type MariaDbInstance,
} from "@/entities/infrastructure";
import { fetchMariaDbDatabases } from "../api/databases";
import { fetchMariaDbDumps, type MariaDbDumpFile } from "../api/dumps";

type MariaDbImportBlockProps = {
  copy: AppText["mariadbInstances"]["import"];
  databaseRefreshSignal?: number;
  defaultDatabase?: string;
  defaultFilePath?: string;
  disabled?: boolean;
  disabledTitle?: string;
  instances: MariaDbInstance[];
  loading?: boolean;
  onImport: (form: MariaDbImportForm) => void;
};

export function MariaDbImportBlock(props: MariaDbImportBlockProps) {
  return (
    <DatabaseDumpImportForm<MariaDbInstance, MariaDbImportForm, MariaDbDumpFile>
      {...props}
      fetchDatabases={fetchMariaDbDatabases}
      fetchDumpFiles={fetchMariaDbDumps}
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
