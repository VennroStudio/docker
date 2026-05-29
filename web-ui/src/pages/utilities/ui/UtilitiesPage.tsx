import { Archive, Download, RefreshCw, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import type { AppText, ArchiveCreateForm, ArchiveExtractForm, ViewConfig, useArchives } from "@/entities/infrastructure";
import { AccordionPanel, Button, Field, SelectField } from "@/shared/ui";
import { ServicePageLayout } from "@/widgets/service-page-layout";

type UtilitiesPageProps = {
  activeOperationKey?: null | string;
  archivesState: ReturnType<typeof useArchives>;
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  text: AppText;
  view: ViewConfig;
  onArchiveCreate: (form: ArchiveCreateForm) => void;
  onArchiveDelete: (name: string) => void;
  onArchiveExtract: (form: ArchiveExtractForm) => void;
};

export function UtilitiesPage({
  activeOperationKey,
  archivesState,
  onArchiveCreate,
  onArchiveDelete,
  onArchiveExtract,
  operationDisabled = false,
  operationDisabledTitle,
  text,
  view,
}: UtilitiesPageProps) {
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
  const createReady = isValidBaseName(createForm.name.trim()) && Boolean(createForm.folder.trim());
  const extractReady = isValidArchiveName(extractForm.name.trim()) && Boolean(extractForm.dest.trim());
  const selectedArchive = archivesState.archives.find((archive) => archive.name === extractForm.name);

  useEffect(() => {
    setExtractForm((current) => {
      if (current.name && archivesState.archives.some((archive) => archive.name === current.name)) return current;
      return { ...current, name: archivesState.archives[0]?.name ?? "" };
    });
  }, [archivesState.archives]);

  const submitCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!createReady || operationDisabled) return;
    onArchiveCreate({ folder: createForm.folder.trim(), name: createForm.name.trim() });
  };

  const submitExtract = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!extractReady || operationDisabled) return;
    onArchiveExtract({ dest: extractForm.dest.trim(), name: extractForm.name.trim() });
  };

  return (
    <ServicePageLayout view={view} eyebrow={text.utilities.eyebrow} description={text.utilities.description}>
      <AccordionPanel
        contentClassName="p-4"
        eyebrow={copy.titleEyebrow}
        open={open}
        title={copy.title}
        onOpenChange={setOpen}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <form
            className="flex min-h-[280px] flex-col rounded-lg border border-sky-100 bg-white/82 p-4 shadow-[0_10px_24px_rgba(14,165,233,0.10)] ring-1 ring-teal-100/40"
            onSubmit={submitCreate}
          >
            <BlockHeader eyebrow={copy.titleEyebrow} title={copy.createTitle} />
            <div className="flex flex-1 flex-col justify-center gap-3">
              <Field
                disabled={operationDisabled}
                error={createForm.name && !isValidBaseName(createForm.name) ? copy.validation.name : undefined}
                label={copy.archiveName}
                placeholder={copy.archiveNamePlaceholder}
                value={createForm.name}
                onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
              />
              <Field
                disabled={operationDisabled}
                error={!createForm.folder && createForm.name ? copy.validation.folder : undefined}
                label={copy.folder}
                placeholder={copy.folderPlaceholder}
                value={createForm.folder}
                onChange={(event) => setCreateForm((current) => ({ ...current, folder: event.target.value }))}
              />
              <Button
                className="mt-auto w-full"
                disabled={!createReady || operationDisabled}
                icon={<Archive size={17} strokeWidth={2.4} />}
                loading={operationDisabled && activeOperationKey === "archive:create"}
                title={!createReady ? copy.validation.createDisabled : operationDisabled ? operationDisabledTitle : undefined}
                tone="primary"
                type="submit"
              >
                {copy.createAction}
              </Button>
            </div>
          </form>

          <form
            className="flex min-h-[280px] flex-col rounded-lg border border-sky-100 bg-white/82 p-4 shadow-[0_10px_24px_rgba(14,165,233,0.10)] ring-1 ring-fuchsia-100/40"
            onSubmit={submitExtract}
          >
            <BlockHeader eyebrow={copy.titleEyebrow} title={copy.extractTitle} />
            <div className="flex flex-1 flex-col justify-center gap-3">
              <div className="grid gap-3 min-[860px]:grid-cols-[minmax(0,1fr)_auto_auto] min-[860px]:items-end">
                <SelectField
                  disabled={operationDisabled || archivesState.loading || archivesState.archives.length === 0}
                  label={copy.archiveSelect}
                  options={archiveOptions}
                  value={extractForm.name}
                  onChange={(event) => setExtractForm((current) => ({ ...current, name: event.target.value }))}
                />
                <Button
                  disabled={operationDisabled || archivesState.loading}
                  icon={<RefreshCw size={16} strokeWidth={2.4} />}
                  loading={archivesState.loading}
                  type="button"
                  onClick={() => void archivesState.refresh()}
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
                    if (selectedArchive) onArchiveDelete(selectedArchive.name);
                  }}
                >
                  {copy.deleteAction}
                </Button>
              </div>
              {archivesState.error ? <p className="text-xs font-medium text-red-600">{archivesState.error}</p> : null}
              <Field
                disabled={operationDisabled}
                error={extractForm.dest && !extractForm.dest.trim() ? copy.validation.dest : undefined}
                label={copy.dest}
                placeholder={copy.destPlaceholder}
                value={extractForm.dest}
                onChange={(event) => setExtractForm((current) => ({ ...current, dest: event.target.value }))}
              />
              <Button
                className="mt-auto w-full"
                disabled={!extractReady || operationDisabled}
                icon={<Download size={17} strokeWidth={2.4} />}
                loading={operationDisabled && activeOperationKey === "archive:extract"}
                title={!extractReady ? copy.validation.archive : operationDisabled ? operationDisabledTitle : undefined}
                tone="primary"
                type="submit"
              >
                {copy.extractAction}
              </Button>
            </div>
          </form>
        </div>
      </AccordionPanel>
    </ServicePageLayout>
  );
}

function BlockHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="mb-4">
      <p className="text-xs font-semibold uppercase text-teal-700">{eyebrow}</p>
      <h2 className="mt-1 text-lg font-bold text-slate-950">{title}</h2>
    </header>
  );
}

function isValidBaseName(value: string) {
  return /^[A-Za-z0-9._-]+$/.test(value);
}

function isValidArchiveName(value: string) {
  return /^[A-Za-z0-9._-]+\.t(ar\.)?gz$/.test(value);
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
