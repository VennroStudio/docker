import { Upload } from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { Button, Field } from "@/shared/ui";
import { DatabaseBlockHeader } from "./DatabaseBlockHeader";
import { DatabaseContainerSelect } from "./DatabaseContainerSelect";
import { DatabaseDumpFileSelect } from "./DatabaseDumpFileSelect";
import { DatabaseNameSelect } from "./DatabaseNameSelect";
import type {
  DatabaseDumpFile,
  DatabaseDumpForm,
  DatabaseImportCopy,
  DatabaseInstanceOption,
  FetchDatabases,
  FetchDumpFiles,
  InstanceLabel,
} from "../../model/database/formTypes";
import { useDatabaseNames } from "../../model/database/useDatabaseNames";
import { useDumpFiles } from "../../model/database/useDumpFiles";

type DatabaseDumpImportFormProps<
  Instance extends DatabaseInstanceOption,
  Form extends DatabaseDumpForm,
  File extends DatabaseDumpFile,
> = {
  copy: DatabaseImportCopy;
  databaseRefreshSignal?: number;
  defaultDatabase?: string;
  defaultFilePath?: string;
  disabled?: boolean;
  disabledTitle?: string;
  fetchDatabases: FetchDatabases;
  fetchDumpFiles: FetchDumpFiles<File>;
  instanceLabel: InstanceLabel<Instance>;
  instances: Instance[];
  isValidDatabaseName: (database: string) => boolean;
  isValidDumpPath: (filePath: string) => boolean;
  loading?: boolean;
  onImport: (form: Form) => void;
};

export function DatabaseDumpImportForm<
  Instance extends DatabaseInstanceOption,
  Form extends DatabaseDumpForm,
  File extends DatabaseDumpFile,
>({
  copy,
  databaseRefreshSignal = 0,
  defaultDatabase = "",
  defaultFilePath = "",
  disabled = false,
  disabledTitle,
  fetchDatabases,
  fetchDumpFiles,
  instanceLabel,
  instances,
  isValidDatabaseName,
  isValidDumpPath,
  loading = false,
  onImport,
}: DatabaseDumpImportFormProps<Instance, Form, File>) {
  const [form, setForm] = useState<Partial<Form>>({});
  const defaultContainer = instances[0]?.container ?? "";
  const containerValue = form.container ?? defaultContainer;
  const filePathValue = form.filePath ?? defaultFilePath;
  const databaseValue = form.database ?? defaultDatabase;
  const container = containerValue.trim();
  const filePath = filePathValue.trim();
  const database = databaseValue.trim();
  const containerReady = instances.some((instance) => instance.container === container);
  const fileReady = isValidDumpPath(filePath);
  const dumpFiles = useDumpFiles(fetchDumpFiles);
  const selectDefaultDatabase = useCallback(
    (names: string[]) => {
      setForm((current) => {
        const currentDatabase = (current.database ?? defaultDatabase).trim();
        if (currentDatabase && names.includes(currentDatabase)) return current;
        return { ...current, database: names[0] ?? "" };
      });
    },
    [defaultDatabase],
  );
  const databaseList = useDatabaseNames({
    container,
    enabled: containerReady,
    fetchDatabases,
    onLoaded: selectDefaultDatabase,
    refreshSignal: databaseRefreshSignal,
  });
  const selectedDatabase = databaseList.databases.includes(database) ? database : "";
  const databaseReady = isValidDatabaseName(database) && databaseList.databases.includes(database);
  const formReady = containerReady && fileReady && databaseReady;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formReady || disabled) return;
    onImport({ container, database, filePath } as Form);
  };

  return (
    <form
      className="flex h-full min-h-[430px] flex-col rounded-lg border border-sky-100/90 bg-white/82 p-3 shadow-[0_14px_34px_rgba(14,165,233,0.11),0_6px_18px_rgba(249,115,22,0.08)] ring-1 ring-orange-100/45"
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
            setForm((current) => ({ ...current, container: event.target.value, database: "" }));
          }}
        />

        <DatabaseDumpFileSelect
          copy={copy}
          disabled={disabled}
          error={dumpFiles.error}
          files={dumpFiles.files}
          loading={dumpFiles.loading}
          onRefresh={() => void dumpFiles.refresh()}
          onSelect={(path) => setForm((current) => ({ ...current, filePath: path }))}
        />

        <Field
          disabled={disabled}
          error={filePath && !fileReady ? copy.validation.filePath : undefined}
          label={copy.filePath}
          placeholder={copy.filePathPlaceholder}
          value={filePathValue}
          onChange={(event) => setForm((current) => ({ ...current, filePath: event.target.value }))}
        />

        <div className="grid gap-3">
          <DatabaseNameSelect
            copy={copy}
            disabled={disabled || !containerReady}
            error={databaseList.error}
            invalid={Boolean(database && !databaseReady)}
            loading={databaseList.loading}
            loadingPlaceholder={copy.refreshFiles}
            names={databaseList.databases}
            value={selectedDatabase}
            onChange={(value) => setForm((current) => ({ ...current, database: value }))}
          />
          <Button
            className="w-full"
            disabled={!formReady || disabled}
            icon={<Upload size={17} strokeWidth={2.4} />}
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
