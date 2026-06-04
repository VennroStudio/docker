import {
  DatabaseDumpImportForm,
  mariaDbDatabaseEngine,
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
      instanceLabel={mariaDbDatabaseEngine.instanceLabel}
      isValidDatabaseName={mariaDbDatabaseEngine.isValidDatabaseName}
      isValidDumpPath={mariaDbDatabaseEngine.isValidDumpPath}
    />
  );
}
