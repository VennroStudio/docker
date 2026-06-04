import {
  DatabaseDumpImportForm,
  postgresDatabaseEngine,
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
      instanceLabel={postgresDatabaseEngine.instanceLabel}
      isValidDatabaseName={postgresDatabaseEngine.isValidDatabaseName}
      isValidDumpPath={postgresDatabaseEngine.isValidDumpPath}
    />
  );
}
