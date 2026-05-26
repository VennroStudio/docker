import { RefreshCw, Upload } from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import type { AppText, MariaDbImportForm, MariaDbInstance } from "@/entities/infrastructure";
import { Button, Field } from "@/shared/ui";
import { fetchMariaDbDumps, type MariaDbDumpFile } from "../api/dumps";

type MariaDbImportBlockProps = {
  copy: AppText["mariadbInstances"]["import"];
  defaultDatabase?: string;
  defaultFilePath?: string;
  disabled?: boolean;
  disabledTitle?: string;
  instances: MariaDbInstance[];
  loading?: boolean;
  onImport: (form: MariaDbImportForm) => void;
};

export function MariaDbImportBlock({
  copy,
  defaultDatabase = "",
  defaultFilePath = "",
  disabled = false,
  disabledTitle,
  instances,
  loading = false,
  onImport,
}: MariaDbImportBlockProps) {
  const [form, setForm] = useState<Partial<MariaDbImportForm>>({});
  const [dumpFiles, setDumpFiles] = useState<MariaDbDumpFile[]>([]);
  const [dumpFilesError, setDumpFilesError] = useState<string | null>(null);
  const [dumpFilesLoading, setDumpFilesLoading] = useState(true);
  const defaultContainer = instances[0]?.container ?? "";
  const containerValue = form.container ?? defaultContainer;
  const filePathValue = form.filePath ?? defaultFilePath;
  const databaseValue = form.database ?? defaultDatabase;
  const container = containerValue.trim();
  const filePath = filePathValue.trim();
  const database = databaseValue.trim();
  const containerReady = instances.some((instance) => instance.container === container);
  const fileReady = filePath.endsWith(".sql") || filePath.endsWith(".sql.gz");
  const databaseReady = /^[A-Za-z0-9_$.-]+$/.test(database);
  const formReady = containerReady && fileReady && databaseReady;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formReady || disabled) return;
    onImport({ container, database, filePath });
  };

  const refreshDumpFiles = useCallback(() => {
    setDumpFilesLoading(true);
    setDumpFilesError(null);
    void fetchMariaDbDumps()
      .then(setDumpFiles)
      .catch((error: unknown) => setDumpFilesError(error instanceof Error ? error.message : String(error)))
      .finally(() => setDumpFilesLoading(false));
  }, []);

  useEffect(() => {
    let mounted = true;

    void fetchMariaDbDumps()
      .then((files) => {
        if (mounted) setDumpFiles(files);
      })
      .catch((error: unknown) => {
        if (mounted) setDumpFilesError(error instanceof Error ? error.message : String(error));
      })
      .finally(() => {
        if (mounted) setDumpFilesLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <form
      className="flex h-full min-h-[430px] flex-col rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 shadow-sm shadow-black/15"
      onSubmit={submit}
    >
      <header className="mb-3">
        <span className="text-[11px] font-semibold uppercase text-teal-300/80">{copy.titleEyebrow}</span>
        <strong className="mt-1 block text-sm font-bold text-zinc-100">{copy.title}</strong>
      </header>

      <div className="flex flex-1 flex-col justify-center gap-3">
        <label className="grid gap-2 text-sm">
          <span className="text-xs font-semibold uppercase text-zinc-500">{copy.container}</span>
          <select
            className="h-10 min-w-0 rounded-lg border border-zinc-700/80 bg-zinc-950/72 px-3 text-sm text-zinc-100 outline-none transition focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/20 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled || instances.length === 0}
            value={containerValue}
            onChange={(event) => setForm((current) => ({ ...current, container: event.target.value }))}
          >
            <option value="">{instances.length > 0 ? copy.containerPlaceholder : copy.emptyInstances}</option>
            {instances.map((instance) => (
              <option key={instance.container} value={instance.container}>
                {instanceLabel(instance)}
              </option>
            ))}
          </select>
          {containerValue && !containerReady ? (
            <span className="text-xs font-medium text-red-200">{copy.validation.container}</span>
          ) : null}
        </label>

        <div className="grid gap-3 min-[780px]:grid-cols-[minmax(0,1fr)_auto] min-[780px]:items-end">
          <label className="grid gap-2 text-sm">
            <span className="text-xs font-semibold uppercase text-zinc-500">{copy.fileSelect}</span>
            <select
              className="h-10 min-w-0 rounded-lg border border-zinc-700/80 bg-zinc-950/72 px-3 text-sm text-zinc-100 outline-none transition focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/20 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled || dumpFilesLoading || dumpFiles.length === 0}
              value=""
              onChange={(event) => {
                const nextPath = event.target.value;
                if (nextPath) setForm((current) => ({ ...current, filePath: nextPath }));
              }}
            >
              <option value="">
                {dumpFilesLoading
                  ? copy.refreshFiles
                  : dumpFiles.length > 0
                    ? copy.fileSelectPlaceholder
                    : copy.emptyFiles}
              </option>
              {dumpFiles.map((file) => (
                <option key={file.path} value={file.path}>
                  {file.path}
                </option>
              ))}
            </select>
          </label>
          <Button
            disabled={disabled || dumpFilesLoading}
            icon={<RefreshCw size={16} strokeWidth={2.4} />}
            loading={dumpFilesLoading}
            type="button"
            onClick={refreshDumpFiles}
          >
            {copy.refreshFiles}
          </Button>
        </div>

        {dumpFilesError ? <p className="text-xs font-medium text-red-200">{dumpFilesError}</p> : null}

        <Field
          disabled={disabled}
          error={filePath && !fileReady ? copy.validation.filePath : undefined}
          label={copy.filePath}
          placeholder={copy.filePathPlaceholder}
          value={filePathValue}
          onChange={(event) => setForm((current) => ({ ...current, filePath: event.target.value }))}
        />

        <div className="grid gap-3 min-[780px]:grid-cols-[minmax(0,1fr)_minmax(190px,240px)] min-[780px]:items-start">
          <Field
            disabled={disabled}
            error={database && !databaseReady ? copy.validation.database : undefined}
            label={copy.database}
            placeholder={copy.databasePlaceholder}
            value={databaseValue}
            onChange={(event) => setForm((current) => ({ ...current, database: event.target.value }))}
          />
          <Button
            className="w-full min-[780px]:mt-6"
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

function instanceLabel(instance: MariaDbInstance) {
  return `MariaDB ${instance.version} / ${instance.container} / :${instance.hostPort}`;
}
