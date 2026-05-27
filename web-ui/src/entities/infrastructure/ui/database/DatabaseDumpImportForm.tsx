import { RefreshCw, Upload } from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { Button, Field } from "@/shared/ui";
import { DatabaseBlockHeader } from "./DatabaseBlockHeader";
import { DatabaseContainerSelect } from "./DatabaseContainerSelect";
import type {
  DatabaseDumpFile,
  DatabaseDumpForm,
  DatabaseImportCopy,
  DatabaseInstanceOption,
  FetchDatabases,
  FetchDumpFiles,
  InstanceLabel,
} from "./formTypes";
import { selectClassName } from "./formUtils";
import { useDatabaseNames } from "./useDatabaseNames";
import { useDumpFiles } from "./useDumpFiles";

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
      className="flex h-full min-h-[430px] flex-col rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 shadow-sm shadow-black/15"
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

        <div className="grid gap-3 min-[780px]:grid-cols-[minmax(0,1fr)_auto] min-[780px]:items-end">
          <label className="grid gap-2 text-sm">
            <span className="text-xs font-semibold uppercase text-zinc-500">{copy.fileSelect}</span>
            <select
              className={selectClassName}
              disabled={disabled || dumpFiles.loading || dumpFiles.files.length === 0}
              value=""
              onChange={(event) => {
                const nextPath = event.target.value;
                if (nextPath) setForm((current) => ({ ...current, filePath: nextPath }));
              }}
            >
              <option value="">
                {dumpFiles.loading
                  ? copy.refreshFiles
                  : dumpFiles.files.length > 0
                    ? copy.fileSelectPlaceholder
                    : copy.emptyFiles}
              </option>
              {dumpFiles.files.map((file) => (
                <option key={file.path} value={file.path}>
                  {file.path}
                </option>
              ))}
            </select>
          </label>
          <Button
            disabled={disabled || dumpFiles.loading}
            icon={<RefreshCw size={16} strokeWidth={2.4} />}
            loading={dumpFiles.loading}
            type="button"
            onClick={() => void dumpFiles.refresh()}
          >
            {copy.refreshFiles}
          </Button>
        </div>

        {dumpFiles.error ? <p className="text-xs font-medium text-red-200">{dumpFiles.error}</p> : null}

        <Field
          disabled={disabled}
          error={filePath && !fileReady ? copy.validation.filePath : undefined}
          label={copy.filePath}
          placeholder={copy.filePathPlaceholder}
          value={filePathValue}
          onChange={(event) => setForm((current) => ({ ...current, filePath: event.target.value }))}
        />

        <div className="grid gap-3">
          <label className="grid gap-2 text-sm">
            <span className="text-xs font-semibold uppercase text-zinc-500">{copy.database}</span>
            <select
              className={selectClassName}
              disabled={disabled || !containerReady || databaseList.loading || databaseList.databases.length === 0}
              value={selectedDatabase}
              onChange={(event) => setForm((current) => ({ ...current, database: event.target.value }))}
            >
              <option value="">{databaseList.loading ? copy.refreshFiles : copy.databasePlaceholder}</option>
              {databaseList.databases.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {databaseList.error ? (
              <span className="text-xs font-medium text-red-200">{databaseList.error}</span>
            ) : database && !databaseReady ? (
              <span className="text-xs font-medium text-red-200">{copy.validation.database}</span>
            ) : null}
          </label>
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
