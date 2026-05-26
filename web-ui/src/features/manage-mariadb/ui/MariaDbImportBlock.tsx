import { RefreshCw, Upload } from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import type { AppText, MariaDbImportForm } from "@/entities/infrastructure";
import { Button, Field } from "@/shared/ui";
import { fetchMariaDbDumps, type MariaDbDumpFile } from "../api/dumps";

type MariaDbImportBlockProps = {
  copy: AppText["mariadbInstances"]["import"];
  disabled?: boolean;
  disabledTitle?: string;
  loading?: boolean;
  onImport: (form: MariaDbImportForm) => void;
};

const initialForm: MariaDbImportForm = {
  database: "",
  filePath: "",
};

export function MariaDbImportBlock({
  copy,
  disabled = false,
  disabledTitle,
  loading = false,
  onImport,
}: MariaDbImportBlockProps) {
  const [form, setForm] = useState(initialForm);
  const [dumpFiles, setDumpFiles] = useState<MariaDbDumpFile[]>([]);
  const [dumpFilesError, setDumpFilesError] = useState<string | null>(null);
  const [dumpFilesLoading, setDumpFilesLoading] = useState(true);
  const filePath = form.filePath.trim();
  const database = form.database.trim();
  const fileReady = filePath.endsWith(".sql") || filePath.endsWith(".sql.gz");
  const databaseReady = /^[A-Za-z0-9_$.-]+$/.test(database);
  const formReady = fileReady && databaseReady;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formReady || disabled) return;
    onImport({ database, filePath });
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
    <form className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 shadow-sm shadow-black/15" onSubmit={submit}>
      <header className="mb-3">
        <span className="text-[11px] font-semibold uppercase text-teal-300/80">{copy.titleEyebrow}</span>
        <strong className="mt-1 block text-sm font-bold text-zinc-100">{copy.title}</strong>
      </header>

      <div className="mb-3 grid gap-3 min-[780px]:grid-cols-[minmax(0,1fr)_auto] min-[780px]:items-end">
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
      {dumpFilesError ? <p className="mb-3 text-xs font-medium text-red-200">{dumpFilesError}</p> : null}

      <div className="grid gap-3 min-[960px]:grid-cols-[minmax(0,1fr)_minmax(180px,260px)_auto] min-[960px]:items-start">
        <Field
          disabled={disabled}
          error={filePath && !fileReady ? copy.validation.filePath : undefined}
          label={copy.filePath}
          placeholder={copy.filePathPlaceholder}
          value={form.filePath}
          onChange={(event) => setForm((current) => ({ ...current, filePath: event.target.value }))}
        />
        <Field
          disabled={disabled}
          error={database && !databaseReady ? copy.validation.database : undefined}
          label={copy.database}
          placeholder={copy.databasePlaceholder}
          value={form.database}
          onChange={(event) => setForm((current) => ({ ...current, database: event.target.value }))}
        />
        <Button
          className="min-[960px]:mt-6"
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
    </form>
  );
}
