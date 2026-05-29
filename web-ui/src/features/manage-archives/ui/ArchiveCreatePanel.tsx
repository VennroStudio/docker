import { Archive } from "lucide-react";
import type { FormEvent } from "react";
import type { AppText, ArchiveCreateForm } from "@/entities/infrastructure";
import { Button, Field } from "@/shared/ui";
import { isValidArchiveBaseName } from "../model/validation";
import { ArchiveBlockHeader } from "./ArchiveBlockHeader";

type ArchiveCreatePanelProps = {
  activeOperationKey?: null | string;
  copy: AppText["utilities"]["archive"];
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  value: ArchiveCreateForm;
  onChange: (value: ArchiveCreateForm) => void;
  onSubmit: (value: ArchiveCreateForm) => void;
};

export function ArchiveCreatePanel({
  activeOperationKey,
  copy,
  onChange,
  onSubmit,
  operationDisabled = false,
  operationDisabledTitle,
  value,
}: ArchiveCreatePanelProps) {
  const ready = isValidArchiveBaseName(value.name.trim()) && Boolean(value.folder.trim());

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ready || operationDisabled) return;
    onSubmit({ folder: value.folder.trim(), name: value.name.trim() });
  };

  return (
    <form
      className="flex min-h-[280px] flex-col rounded-lg border border-sky-100 bg-white/82 p-4 shadow-[0_10px_24px_rgba(14,165,233,0.10)] ring-1 ring-teal-100/40"
      onSubmit={submit}
    >
      <ArchiveBlockHeader eyebrow={copy.titleEyebrow} title={copy.createTitle} />
      <div className="flex flex-1 flex-col justify-center gap-3">
        <Field
          disabled={operationDisabled}
          error={value.name && !isValidArchiveBaseName(value.name) ? copy.validation.name : undefined}
          label={copy.archiveName}
          placeholder={copy.archiveNamePlaceholder}
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
        />
        <Field
          disabled={operationDisabled}
          error={!value.folder && value.name ? copy.validation.folder : undefined}
          label={copy.folder}
          placeholder={copy.folderPlaceholder}
          value={value.folder}
          onChange={(event) => onChange({ ...value, folder: event.target.value })}
        />
        <Button
          className="mt-auto w-full"
          disabled={!ready || operationDisabled}
          icon={<Archive size={17} strokeWidth={2.4} />}
          loading={operationDisabled && activeOperationKey === "archive:create"}
          title={!ready ? copy.validation.createDisabled : operationDisabled ? operationDisabledTitle : undefined}
          tone="primary"
          type="submit"
        >
          {copy.createAction}
        </Button>
      </div>
    </form>
  );
}
