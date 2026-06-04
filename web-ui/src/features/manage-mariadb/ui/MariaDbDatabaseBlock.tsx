import {
  DatabaseCatalogBlock,
  mariaDbDatabaseEngine,
  type AppText,
  type MariaDbDatabaseForm,
  type MariaDbInstance,
} from "@/entities/infrastructure";
import { fetchMariaDbDatabases } from "../api/databases";

type MariaDbDatabaseBlockProps = {
  copy: AppText["mariadbInstances"]["databaseManager"];
  disabled?: boolean;
  disabledTitle?: string;
  instances: MariaDbInstance[];
  loadingCreate?: boolean;
  loadingDrop?: boolean;
  refreshSignal?: number;
  onCreate: (form: MariaDbDatabaseForm) => void;
  onDrop: (form: MariaDbDatabaseForm) => void;
};

export function MariaDbDatabaseBlock(props: MariaDbDatabaseBlockProps) {
  return (
    <DatabaseCatalogBlock<MariaDbInstance, MariaDbDatabaseForm>
      {...props}
      fetchDatabases={fetchMariaDbDatabases}
      idPrefix="mariadb"
      instanceLabel={mariaDbDatabaseEngine.instanceLabel}
      isValidDatabaseName={mariaDbDatabaseEngine.isValidDatabaseName}
    />
  );
}
