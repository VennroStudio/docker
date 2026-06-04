import {
  DatabaseDumpExportForm,
  postgresDatabaseEngine,
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
      getSuggestedFilePath={postgresDatabaseEngine.getSuggestedFilePath}
      instanceLabel={postgresDatabaseEngine.instanceLabel}
      isValidDatabaseName={postgresDatabaseEngine.isValidDatabaseName}
      isValidDumpPath={postgresDatabaseEngine.isValidDumpPath}
    />
  );
}
