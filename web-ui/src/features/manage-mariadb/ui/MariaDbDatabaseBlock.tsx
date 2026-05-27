import {
  DatabaseCatalogBlock,
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
      instanceLabel={instanceLabel}
      isValidDatabaseName={isValidDatabaseName}
    />
  );
}

function isValidDatabaseName(database: string) {
  return /^[A-Za-z0-9_$.-]+$/.test(database);
}

function instanceLabel(instance: MariaDbInstance) {
  return `MariaDB ${instance.version} / ${instance.container} / :${instance.hostPort}`;
}
