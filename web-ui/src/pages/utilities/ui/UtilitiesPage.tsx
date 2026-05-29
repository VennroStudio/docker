import type {
  AppText,
  ArchiveCreateForm,
  ArchiveExtractForm,
  ViewConfig,
  useArchives,
} from "@/entities/infrastructure";
import { ArchiveManagerAccordion } from "@/features/manage-archives";
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
  return (
    <ServicePageLayout view={view} eyebrow={text.utilities.eyebrow} description={text.utilities.description}>
      <ArchiveManagerAccordion
        activeOperationKey={activeOperationKey}
        archivesState={archivesState}
        operationDisabled={operationDisabled}
        operationDisabledTitle={operationDisabledTitle}
        text={text}
        onArchiveCreate={onArchiveCreate}
        onArchiveDelete={onArchiveDelete}
        onArchiveExtract={onArchiveExtract}
      />
    </ServicePageLayout>
  );
}
