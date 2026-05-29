import { Download } from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import { Button, Field } from "@/shared/ui";
import { DatabaseBlockHeader } from "./DatabaseBlockHeader";
import { DatabaseContainerSelect } from "./DatabaseContainerSelect";
import { DatabaseNameSelect } from "./DatabaseNameSelect";
import type {
  DatabaseDumpForm,
  DatabaseExportCopy,
  DatabaseInstanceOption,
  FetchDatabases,
  InstanceLabel,
} from "../../model/database/formTypes";
import { useDatabaseNames } from "../../model/database/useDatabaseNames";

type DatabaseDumpExportFormProps<Instance extends DatabaseInstanceOption, Form extends DatabaseDumpForm> = {
  copy: DatabaseExportCopy;
  databaseRefreshSignal?: number;
  defaultDatabase?: string;
  defaultFilePath?: string;
  disabled?: boolean;
  disabledTitle?: string;
  fetchDatabases: FetchDatabases;
  getSuggestedFilePath: (database: string) => string;
  initialDatabase?: string;
  instanceLabel: InstanceLabel<Instance>;
  instances: Instance[];
  isValidDatabaseName: (database: string) => boolean;
  isValidDumpPath: (filePath: string) => boolean;
  loading?: boolean;
  onExport: (form: Form) => void;
};

export function DatabaseDumpExportForm<Instance extends DatabaseInstanceOption, Form extends DatabaseDumpForm>({
  copy,
  databaseRefreshSignal = 0,
  defaultDatabase = "",
  defaultFilePath = "",
  disabled = false,
  disabledTitle,
  fetchDatabases,
  getSuggestedFilePath,
  initialDatabase = "app",
  instanceLabel,
  instances,
  isValidDatabaseName,
  isValidDumpPath,
  loading = false,
  onExport,
}: DatabaseDumpExportFormProps<Instance, Form>) {
  const [container, setContainer] = useState<string>();
  const [database, setDatabase] = useState<string>();
  const [filePath, setFilePath] = useState<string>();
  const defaultContainer = instances[0]?.container ?? "";
  const containerValue = container ?? defaultContainer;
  const normalizedContainer = containerValue.trim();
  const databaseValue = database ?? defaultDatabase;
  const normalizedDatabase = databaseValue.trim();
  const suggestedPath = useMemo(() => {
    return getSuggestedFilePath(normalizedDatabase || initialDatabase);
  }, [getSuggestedFilePath, initialDatabase, normalizedDatabase]);
  const filePathValue = filePath ?? (defaultFilePath || (normalizedDatabase ? suggestedPath : ""));
  const normalizedFilePath = filePathValue.trim();
  const containerReady = instances.some((instance) => instance.container === normalizedContainer);
  const selectDefaultDatabase = useCallback(
    (names: string[]) => {
      setDatabase((current) => {
        const currentDatabase = (current ?? defaultDatabase).trim();
        if (currentDatabase && names.includes(currentDatabase)) return current;
        return names[0] ?? "";
      });
    },
    [defaultDatabase],
  );
  const databaseList = useDatabaseNames({
    container: normalizedContainer,
    enabled: containerReady,
    fetchDatabases,
    onLoaded: selectDefaultDatabase,
    refreshSignal: databaseRefreshSignal,
  });
  const fileReady = isValidDumpPath(normalizedFilePath);
  const selectedDatabase = databaseList.databases.includes(normalizedDatabase) ? normalizedDatabase : "";
  const databaseReady = isValidDatabaseName(normalizedDatabase) && databaseList.databases.includes(normalizedDatabase);
  const formReady = containerReady && fileReady && databaseReady;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formReady || disabled) return;
    onExport({ container: normalizedContainer, database: normalizedDatabase, filePath: normalizedFilePath } as Form);
  };

  return (
    <form
      className="flex h-full min-h-[430px] flex-col rounded-lg border border-sky-100/90 bg-white/82 p-3 shadow-[0_14px_34px_rgba(14,165,233,0.11),0_6px_18px_rgba(168,85,247,0.09)] ring-1 ring-fuchsia-100/45"
      onSubmit={submit}
    >
      <DatabaseBlockHeader eyebrow={copy.titleEyebrow} title={copy.title} />

      <div className="flex flex-1 flex-col justify-center gap-3">
        <DatabaseContainerSelect
          copy={copy}
          disabled={disabled}
          instanceLabel={instanceLabel}
          instances={instances}
          ready={containerReady}
          value={containerValue}
          onChange={(event) => {
            setContainer(event.target.value);
            setDatabase("");
          }}
        />

        <Field
          disabled={disabled}
          error={normalizedFilePath && !fileReady ? copy.validation.filePath : undefined}
          label={copy.filePath}
          placeholder={copy.filePathPlaceholder}
          value={filePathValue}
          onChange={(event) => setFilePath(event.target.value)}
        />

        <div className="grid gap-3">
          <DatabaseNameSelect
            copy={copy}
            disabled={disabled || !containerReady}
            error={databaseList.error}
            invalid={Boolean(normalizedDatabase && !databaseReady)}
            loading={databaseList.loading}
            loadingPlaceholder={copy.containerPlaceholder}
            names={databaseList.databases}
            value={selectedDatabase}
            onChange={(nextDatabase) => {
              setDatabase(nextDatabase);
              if (!filePathValue || filePathValue === suggestedPath) {
                setFilePath(getSuggestedFilePath(nextDatabase.trim() || initialDatabase));
              }
            }}
          />
          <Button
            className="w-full"
            disabled={!formReady || disabled}
            icon={<Download size={17} strokeWidth={2.4} />}
            loading={loading}
            title={!formReady ? copy.validation.disabled : disabled ? disabledTitle : undefined}
            tone="primary"
            type="submit"
          >
            {copy.action}
          </Button>
        </div>
      </div>
    </form>
  );
}
