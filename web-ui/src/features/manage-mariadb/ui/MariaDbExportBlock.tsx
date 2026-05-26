import { Download } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import type { AppText, MariaDbExportForm } from "@/entities/infrastructure";
import { Button, Field } from "@/shared/ui";

type MariaDbExportBlockProps = {
  copy: AppText["mariadbInstances"]["export"];
  disabled?: boolean;
  disabledTitle?: string;
  loading?: boolean;
  onExport: (form: MariaDbExportForm) => void;
};

const initialDatabase = "app";

export function MariaDbExportBlock({
  copy,
  disabled = false,
  disabledTitle,
  loading = false,
  onExport,
}: MariaDbExportBlockProps) {
  const [database, setDatabase] = useState("");
  const [filePath, setFilePath] = useState("");
  const normalizedDatabase = database.trim();
  const normalizedFilePath = filePath.trim();
  const fileReady = normalizedFilePath.endsWith(".sql") || normalizedFilePath.endsWith(".sql.gz");
  const databaseReady = /^[A-Za-z0-9_$.-]+$/.test(normalizedDatabase);
  const formReady = fileReady && databaseReady;
  const suggestedPath = useMemo(() => {
    const name = normalizedDatabase || initialDatabase;
    return `dumps/${name}.sql.gz`;
  }, [normalizedDatabase]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formReady || disabled) return;
    onExport({ database: normalizedDatabase, filePath: normalizedFilePath });
  };

  return (
    <form className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 shadow-sm shadow-black/15" onSubmit={submit}>
      <header className="mb-3">
        <span className="text-[11px] font-semibold uppercase text-teal-300/80">{copy.titleEyebrow}</span>
        <strong className="mt-1 block text-sm font-bold text-zinc-100">{copy.title}</strong>
      </header>

      <div className="grid gap-3">
        <Field
          disabled={disabled}
          error={normalizedDatabase && !databaseReady ? copy.validation.database : undefined}
          label={copy.database}
          placeholder={copy.databasePlaceholder}
          value={database}
          onChange={(event) => {
            const nextDatabase = event.target.value;
            setDatabase(nextDatabase);
            if (!filePath || filePath === suggestedPath)
              setFilePath(`dumps/${nextDatabase.trim() || initialDatabase}.sql.gz`);
          }}
        />
        <Field
          disabled={disabled}
          error={normalizedFilePath && !fileReady ? copy.validation.filePath : undefined}
          label={copy.filePath}
          placeholder={copy.filePathPlaceholder}
          value={filePath}
          onChange={(event) => setFilePath(event.target.value)}
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
    </form>
  );
}
