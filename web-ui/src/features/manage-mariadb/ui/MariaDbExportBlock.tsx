import { Download } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import type { AppText, MariaDbExportForm, MariaDbInstance } from "@/entities/infrastructure";
import { Button, Field } from "@/shared/ui";

type MariaDbExportBlockProps = {
  copy: AppText["mariadbInstances"]["export"];
  defaultDatabase?: string;
  defaultFilePath?: string;
  disabled?: boolean;
  disabledTitle?: string;
  instances: MariaDbInstance[];
  loading?: boolean;
  onExport: (form: MariaDbExportForm) => void;
};

const initialDatabase = "app";

export function MariaDbExportBlock({
  copy,
  defaultDatabase = "",
  defaultFilePath = "",
  disabled = false,
  disabledTitle,
  instances,
  loading = false,
  onExport,
}: MariaDbExportBlockProps) {
  const [container, setContainer] = useState<string>();
  const [database, setDatabase] = useState<string>();
  const [filePath, setFilePath] = useState<string>();
  const defaultContainer = instances[0]?.container ?? "";
  const containerValue = container ?? defaultContainer;
  const normalizedContainer = containerValue.trim();
  const databaseValue = database ?? defaultDatabase;
  const filePathValue = filePath ?? defaultFilePath;
  const normalizedDatabase = databaseValue.trim();
  const normalizedFilePath = filePathValue.trim();
  const containerReady = instances.some((instance) => instance.container === normalizedContainer);
  const fileReady = normalizedFilePath.endsWith(".sql") || normalizedFilePath.endsWith(".sql.gz");
  const databaseReady = /^[A-Za-z0-9_$.-]+$/.test(normalizedDatabase);
  const formReady = containerReady && fileReady && databaseReady;
  const suggestedPath = useMemo(() => {
    const name = normalizedDatabase || initialDatabase;
    return `dumps/${name}.sql.gz`;
  }, [normalizedDatabase]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formReady || disabled) return;
    onExport({ container: normalizedContainer, database: normalizedDatabase, filePath: normalizedFilePath });
  };

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
            onChange={(event) => setContainer(event.target.value)}
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
        <Field
          disabled={disabled}
          error={normalizedFilePath && !fileReady ? copy.validation.filePath : undefined}
          label={copy.filePath}
          placeholder={copy.filePathPlaceholder}
          value={filePathValue}
          onChange={(event) => setFilePath(event.target.value)}
        />

        <div className="grid gap-3 min-[780px]:grid-cols-[minmax(0,1fr)_minmax(190px,240px)] min-[780px]:items-start">
          <Field
            disabled={disabled}
            error={normalizedDatabase && !databaseReady ? copy.validation.database : undefined}
            label={copy.database}
            placeholder={copy.databasePlaceholder}
            value={databaseValue}
            onChange={(event) => {
              const nextDatabase = event.target.value;
              setDatabase(nextDatabase);
              if (!filePathValue || filePathValue === suggestedPath)
                setFilePath(`dumps/${nextDatabase.trim() || initialDatabase}.sql.gz`);
            }}
          />
          <Button
            className="w-full min-[780px]:mt-6"
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

function instanceLabel(instance: MariaDbInstance) {
  return `MariaDB ${instance.version} / ${instance.container} / :${instance.hostPort}`;
}
