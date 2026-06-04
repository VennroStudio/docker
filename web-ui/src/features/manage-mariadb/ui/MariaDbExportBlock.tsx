import {
  DatabaseDumpExportForm,
  mariaDbDatabaseEngine,
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
      getSuggestedFilePath={mariaDbDatabaseEngine.getSuggestedFilePath}
      instanceLabel={mariaDbDatabaseEngine.instanceLabel}
      isValidDatabaseName={mariaDbDatabaseEngine.isValidDatabaseName}
      isValidDumpPath={mariaDbDatabaseEngine.isValidDumpPath}
    />
  );
}
