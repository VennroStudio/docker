import { useEffect, useMemo, useState } from "react";
import type { AppText, ArchiveCreateForm, ArchiveExtractForm, useArchives } from "@/entities/infrastructure";
import { AccordionPanel } from "@/shared/ui";
import { formatBytes, formatDate } from "../model/archiveFormat";
import { ArchiveCreatePanel } from "./ArchiveCreatePanel";
import { ArchiveExtractPanel } from "./ArchiveExtractPanel";

type ArchiveManagerAccordionProps = {
  activeOperationKey?: null | string;
  archivesState: ReturnType<typeof useArchives>;
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  text: AppText;
  onArchiveCreate: (form: ArchiveCreateForm) => void;
  onArchiveDelete: (name: string) => void;
  onArchiveExtract: (form: ArchiveExtractForm) => void;
};

export function ArchiveManagerAccordion({
  activeOperationKey,
  archivesState,
  onArchiveCreate,
  onArchiveDelete,
  onArchiveExtract,
  operationDisabled,
  operationDisabledTitle,
  text,
}: ArchiveManagerAccordionProps) {
  const copy = text.utilities.archive;
  const [open, setOpen] = useState(true);
  const [createForm, setCreateForm] = useState<ArchiveCreateForm>({ folder: "", name: "" });
  const [extractForm, setExtractForm] = useState<ArchiveExtractForm>({ dest: "", name: "" });
  const archiveOptions = useMemo(
    () => [
      {
        label: archivesState.loading
          ? copy.refresh
          : archivesState.archives.length > 0
            ? copy.archiveSelectPlaceholder
            : copy.emptyArchives,
        value: "",
      },
      ...archivesState.archives.map((archive) => ({
        label: `${archive.name} / ${formatBytes(archive.size)} / ${formatDate(archive.modifiedAt)}`,
        value: archive.name,
      })),
    ],
    [archivesState.archives, archivesState.loading, copy.archiveSelectPlaceholder, copy.emptyArchives, copy.refresh],
  );

  useEffect(() => {
    setExtractForm((current) => {
      if (current.name && archivesState.archives.some((archive) => archive.name === current.name)) return current;
      return { ...current, name: archivesState.archives[0]?.name ?? "" };
    });
  }, [archivesState.archives]);

  return (
    <AccordionPanel
      contentClassName="p-4"
      eyebrow={copy.titleEyebrow}
      open={open}
      title={copy.title}
      onOpenChange={setOpen}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <ArchiveCreatePanel
          activeOperationKey={activeOperationKey}
          copy={copy}
          operationDisabled={operationDisabled}
          operationDisabledTitle={operationDisabledTitle}
          value={createForm}
          onChange={setCreateForm}
          onSubmit={onArchiveCreate}
        />
        <ArchiveExtractPanel
          activeOperationKey={activeOperationKey}
          archiveOptions={archiveOptions}
          archives={archivesState.archives}
          copy={copy}
          error={archivesState.error}
          loading={archivesState.loading}
          operationDisabled={operationDisabled}
          operationDisabledTitle={operationDisabledTitle}
          value={extractForm}
          onChange={setExtractForm}
          onDelete={onArchiveDelete}
          onRefresh={() => void archivesState.refresh()}
          onSubmit={onArchiveExtract}
        />
      </div>
    </AccordionPanel>
  );
}
