import type { AppText } from "@/entities/infrastructure";
import type { ConfirmDialogApi, RunWithTerminal } from "./operationTypes";
import { useMariaDbOperations } from "./useMariaDbOperations";
import { usePostgresOperations } from "./usePostgresOperations";

type UseDatabaseOperationsConfig = {
  confirmDialog: ConfirmDialogApi;
  refreshDatabaseCatalog: () => void;
  refreshMariaDbInstances: () => void;
  refreshPostgresInstances: () => void;
  runWithTerminal: RunWithTerminal;
  text: AppText;
};

export function useDatabaseOperations({
  confirmDialog,
  refreshDatabaseCatalog,
  refreshMariaDbInstances,
  refreshPostgresInstances,
  runWithTerminal,
  text,
}: UseDatabaseOperationsConfig) {
  const mariaDbOperations = useMariaDbOperations({
    confirmDialog,
    refreshDatabaseCatalog,
    refreshMariaDbInstances,
    runWithTerminal,
    text,
  });
  const postgresOperations = usePostgresOperations({
    confirmDialog,
    refreshDatabaseCatalog,
    refreshPostgresInstances,
    runWithTerminal,
    text,
  });

  return {
    ...mariaDbOperations,
    ...postgresOperations,
  };
}
