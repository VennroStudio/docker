import { Plus, RefreshCw, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { Button, Field } from "@/shared/ui";
import { DatabaseBlockHeader } from "./DatabaseBlockHeader";
import { DatabaseContainerSelect } from "./DatabaseContainerSelect";
import { DatabaseNameSelect } from "./DatabaseNameSelect";
import type {
  DatabaseCatalogCopy,
  DatabaseCatalogForm,
  DatabaseInstanceOption,
  FetchDatabases,
  InstanceLabel,
} from "../../model/database/formTypes";
import { useDatabaseNames } from "../../model/database/useDatabaseNames";

type DatabaseCatalogBlockProps<Instance extends DatabaseInstanceOption, Form extends DatabaseCatalogForm> = {
  copy: DatabaseCatalogCopy;
  disabled?: boolean;
  disabledTitle?: string;
  fetchDatabases: FetchDatabases;
  idPrefix: string;
  instanceLabel: InstanceLabel<Instance>;
  instances: Instance[];
  isValidDatabaseName: (database: string) => boolean;
  loadingCreate?: boolean;
  loadingDrop?: boolean;
  refreshSignal?: number;
  onCreate: (form: Form) => void;
  onDrop: (form: Form) => void;
};

export function DatabaseCatalogBlock<Instance extends DatabaseInstanceOption, Form extends DatabaseCatalogForm>({
  copy,
  disabled = false,
  disabledTitle,
  fetchDatabases,
  idPrefix,
  instanceLabel,
  instances,
  isValidDatabaseName,
  loadingCreate = false,
  loadingDrop = false,
  onCreate,
  onDrop,
  refreshSignal = 0,
}: DatabaseCatalogBlockProps<Instance, Form>) {
  const [container, setContainer] = useState<string>();
  const [databaseToCreate, setDatabaseToCreate] = useState("");
  const [databaseToDrop, setDatabaseToDrop] = useState("");
  const defaultContainer = instances[0]?.container ?? "";
  const containerValue = container ?? defaultContainer;
  const normalizedContainer = containerValue.trim();
  const normalizedCreateDatabase = databaseToCreate.trim();
  const normalizedDropDatabase = databaseToDrop.trim();
  const containerReady = instances.some((instance) => instance.container === normalizedContainer);
  const selectDefaultDropDatabase = useCallback((names: string[]) => {
    setDatabaseToDrop((current) => (names.includes(current) ? current : (names[0] ?? "")));
  }, []);
  const databaseList = useDatabaseNames({
    container: normalizedContainer,
    enabled: containerReady,
    fetchDatabases,
    onLoaded: selectDefaultDropDatabase,
    refreshSignal,
  });
  const createReady = containerReady && isValidDatabaseName(normalizedCreateDatabase);
  const dropReady = containerReady && databaseList.databases.includes(normalizedDropDatabase);
  const createFormId = `${idPrefix}-database-create-form`;
  const dropFormId = `${idPrefix}-database-drop-form`;

  const submitCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!createReady || disabled) return;
    onCreate({ container: normalizedContainer, database: normalizedCreateDatabase } as Form);
  };

  const submitDrop = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dropReady || disabled) return;
    onDrop({ container: normalizedContainer, database: normalizedDropDatabase } as Form);
  };

  return (
    <section className="rounded-lg border border-sky-100/90 bg-white/82 p-3 shadow-[0_14px_34px_rgba(14,165,233,0.11),0_6px_18px_rgba(168,85,247,0.08)] ring-1 ring-fuchsia-100/45">
      <DatabaseBlockHeader eyebrow={copy.titleEyebrow} title={copy.title} />

      <div className="grid gap-3 min-[1180px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <DatabaseContainerSelect
          copy={copy}
          disabled={disabled}
          instanceLabel={instanceLabel}
          instances={instances}
          ready={containerReady}
          value={containerValue}
          onChange={(event) => {
            setContainer(event.target.value);
            setDatabaseToDrop("");
          }}
        />

        <form id={createFormId} className="grid gap-2" onSubmit={submitCreate}>
          <Field
            disabled={disabled}
            error={
              databaseToCreate && !isValidDatabaseName(normalizedCreateDatabase) ? copy.validation.database : undefined
            }
            label={copy.createAction}
            placeholder={copy.createPlaceholder}
            value={databaseToCreate}
            onChange={(event) => setDatabaseToCreate(event.target.value)}
          />
        </form>
      </div>

      <div className="mt-3 grid gap-3 min-[1180px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] min-[1180px]:items-start">
        <form id={dropFormId} className="grid gap-2" onSubmit={submitDrop}>
          <DatabaseNameSelect
            copy={{ ...copy, databasePlaceholder: copy.emptyDatabases }}
            disabled={disabled || !containerReady}
            error={databaseList.error}
            loading={databaseList.loading}
            loadingPlaceholder={copy.refresh}
            names={databaseList.databases}
            value={databaseToDrop}
            onChange={setDatabaseToDrop}
          />
        </form>

        <div className="grid gap-2 min-[720px]:grid-cols-3 min-[1180px]:mt-6">
          <Button
            className="w-full"
            disabled={disabled || !containerReady || databaseList.loading}
            icon={<RefreshCw size={16} strokeWidth={2.4} />}
            loading={databaseList.loading}
            type="button"
            onClick={() => void databaseList.refresh()}
          >
            {copy.refresh}
          </Button>
          <Button
            className="w-full"
            disabled={!createReady || disabled}
            form={createFormId}
            icon={<Plus size={17} strokeWidth={2.4} />}
            loading={loadingCreate}
            title={!createReady ? copy.validation.createDisabled : disabled ? disabledTitle : undefined}
            tone="primary"
            type="submit"
          >
            {copy.createAction}
          </Button>
          <Button
            className="w-full"
            disabled={!dropReady || disabled}
            form={dropFormId}
            icon={<Trash2 size={17} strokeWidth={2.4} />}
            loading={loadingDrop}
            title={!dropReady ? copy.validation.deleteDisabled : disabled ? disabledTitle : undefined}
            tone="danger"
            type="submit"
          >
            {copy.deleteAction}
          </Button>
        </div>
      </div>
    </section>
  );
}
