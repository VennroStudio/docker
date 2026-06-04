import {
  DatabaseCatalogBlock,
  postgresDatabaseEngine,
  type AppText,
  type PostgresDatabaseForm,
  type PostgresInstance,
} from "@/entities/infrastructure";
import { fetchPostgresDatabases } from "../api/databases";

type PostgresDatabaseBlockProps = {
  copy: AppText["postgresInstances"]["databaseManager"];
  disabled?: boolean;
  disabledTitle?: string;
  instances: PostgresInstance[];
  loadingCreate?: boolean;
  loadingDrop?: boolean;
  refreshSignal?: number;
  onCreate: (form: PostgresDatabaseForm) => void;
  onDrop: (form: PostgresDatabaseForm) => void;
};

export function PostgresDatabaseBlock(props: PostgresDatabaseBlockProps) {
  return (
    <DatabaseCatalogBlock<PostgresInstance, PostgresDatabaseForm>
      {...props}
      fetchDatabases={fetchPostgresDatabases}
      idPrefix="postgres"
      instanceLabel={postgresDatabaseEngine.instanceLabel}
      isValidDatabaseName={postgresDatabaseEngine.isValidDatabaseName}
    />
  );
}
