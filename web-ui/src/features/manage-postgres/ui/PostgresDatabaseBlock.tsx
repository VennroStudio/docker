import {
  DatabaseCatalogBlock,
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
      instanceLabel={instanceLabel}
      isValidDatabaseName={isValidDatabaseName}
    />
  );
}

function isValidDatabaseName(database: string) {
  return /^[A-Za-z0-9_]+$/.test(database);
}

function instanceLabel(instance: PostgresInstance) {
  return `Postgres ${instance.version} / ${instance.container} / :${instance.hostPort}`;
}
