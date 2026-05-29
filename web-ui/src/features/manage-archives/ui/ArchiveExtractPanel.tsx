import { Download, RefreshCw, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import type { AppText, ArchiveExtractForm, ArchiveFile } from "@/entities/infrastructure";
import { Button, Field, SelectField } from "@/shared/ui";
import { isValidArchiveFileName } from "../model/validation";
import { ArchiveBlockHeader } from "./ArchiveBlockHeader";

type ArchiveExtractPanelProps = {
  activeOperationKey?: null | string;
  archiveOptions: { label: string; value: string }[];
  archives: ArchiveFile[];
  copy: AppText["utilities"]["archive"];
  error?: null | string;
  loading?: boolean;
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  value: ArchiveExtractForm;
  onChange: (value: ArchiveExtractForm) => void;
  onDelete: (name: string) => void;
  onRefresh: () => void;
  onSubmit: (value: ArchiveExtractForm) => void;
};

export function ArchiveExtractPanel({
  activeOperationKey,
  archiveOptions,
  archives,
  copy,
  error,
  loading = false,
  onChange,
  onDelete,
  onRefresh,
  onSubmit,
  operationDisabled = false,
  operationDisabledTitle,
  value,
}: ArchiveExtractPanelProps) {
  const ready = isValidArchiveFileName(value.name.trim()) && Boolean(value.dest.trim());
  const selectedArchive = archives.find((archive) => archive.name === value.name);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ready || operationDisabled) return;
    onSubmit({ dest: value.dest.trim(), name: value.name.trim() });
  };

  return (
    <form
      className="flex min-h-[280px] flex-col rounded-lg border border-sky-100 bg-white/82 p-4 shadow-[0_10px_24px_rgba(14,165,233,0.10)] ring-1 ring-fuchsia-100/40"
      onSubmit={submit}
    >
      <ArchiveBlockHeader eyebrow={copy.titleEyebrow} title={copy.extractTitle} />
      <div className="flex flex-1 flex-col justify-center gap-3">
        <div className="grid gap-3 min-[860px]:grid-cols-[minmax(0,1fr)_auto_auto] min-[860px]:items-end">
          <SelectField
            disabled={operationDisabled || loading || archives.length === 0}
            label={copy.archiveSelect}
            options={archiveOptions}
            value={value.name}
            onChange={(event) => onChange({ ...value, name: event.target.value })}
          />
          <Button
            disabled={operationDisabled || loading}
            icon={<RefreshCw size={16} strokeWidth={2.4} />}
            loading={loading}
            type="button"
            onClick={onRefresh}
          >
            {copy.refresh}
          </Button>
          <Button
            disabled={!selectedArchive || operationDisabled}
            icon={<Trash2 size={16} strokeWidth={2.4} />}
            loading={operationDisabled && activeOperationKey === "archive:delete"}
            title={!selectedArchive ? copy.validation.archive : operationDisabled ? operationDisabledTitle : undefined}
            tone="danger"
            type="button"
            onClick={() => {
              if (selectedArchive) onDelete(selectedArchive.name);
            }}
          >
            {copy.deleteAction}
          </Button>
        </div>
        {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
        <Field
          disabled={operationDisabled}
          error={value.dest && !value.dest.trim() ? copy.validation.dest : undefined}
          label={copy.dest}
          placeholder={copy.destPlaceholder}
          value={value.dest}
          onChange={(event) => onChange({ ...value, dest: event.target.value })}
        />
        <Button
          className="mt-auto w-full"
          disabled={!ready || operationDisabled}
          icon={<Download size={17} strokeWidth={2.4} />}
          loading={operationDisabled && activeOperationKey === "archive:extract"}
          title={!ready ? copy.validation.archive : operationDisabled ? operationDisabledTitle : undefined}
          tone="primary"
          type="submit"
        >
          {copy.extractAction}
        </Button>
      </div>
    </form>
  );
}
