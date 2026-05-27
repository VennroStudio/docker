import { Plus, RefreshCw, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import type { AppText, MariaDbDatabaseForm, MariaDbInstance } from "@/entities/infrastructure";
import { Button, Field } from "@/shared/ui";
import { fetchMariaDbDatabases } from "../api/databases";

type MariaDbDatabaseBlockProps = {
  copy: AppText["mariadbInstances"]["databaseManager"];
  disabled?: boolean;
  disabledTitle?: string;
  instances: MariaDbInstance[];
  loadingCreate?: boolean;
  loadingDrop?: boolean;
  refreshSignal?: number;
  onCreate: (form: MariaDbDatabaseForm) => void;
  onDrop: (form: MariaDbDatabaseForm) => void;
};

export function MariaDbDatabaseBlock({
  copy,
  disabled = false,
  disabledTitle,
  instances,
  loadingCreate = false,
  loadingDrop = false,
  onCreate,
  onDrop,
  refreshSignal = 0,
}: MariaDbDatabaseBlockProps) {
  const [container, setContainer] = useState<string>();
  const [databases, setDatabases] = useState<string[]>([]);
  const [databaseToCreate, setDatabaseToCreate] = useState("");
  const [databaseToDrop, setDatabaseToDrop] = useState("");
  const [databasesError, setDatabasesError] = useState<string | null>(null);
  const [databasesLoading, setDatabasesLoading] = useState(false);
  const defaultContainer = instances[0]?.container ?? "";
  const containerValue = container ?? defaultContainer;
  const normalizedContainer = containerValue.trim();
  const normalizedCreateDatabase = databaseToCreate.trim();
  const normalizedDropDatabase = databaseToDrop.trim();
  const containerReady = instances.some((instance) => instance.container === normalizedContainer);
  const createReady = containerReady && isValidDatabaseName(normalizedCreateDatabase);
  const dropReady = containerReady && databases.includes(normalizedDropDatabase);

  const refreshDatabases = useCallback(() => {
    if (!containerReady) {
      setDatabases([]);
      setDatabaseToDrop("");
      return;
    }

    setDatabasesLoading(true);
    setDatabasesError(null);

    void fetchMariaDbDatabases(normalizedContainer)
      .then((names) => {
        setDatabases(names);
        setDatabaseToDrop((current) => (names.includes(current) ? current : (names[0] ?? "")));
      })
      .catch((error: unknown) => {
        setDatabases([]);
        setDatabaseToDrop("");
        setDatabasesError(error instanceof Error ? error.message : String(error));
      })
      .finally(() => setDatabasesLoading(false));
  }, [containerReady, normalizedContainer]);

  useEffect(() => {
    if (!containerReady) return undefined;

    let mounted = true;

    void Promise.resolve()
      .then(() => {
        if (mounted) {
          setDatabasesLoading(true);
          setDatabasesError(null);
        }
        return fetchMariaDbDatabases(normalizedContainer);
      })
      .then((names) => {
        if (!mounted) return;
        setDatabases(names);
        setDatabaseToDrop((current) => (names.includes(current) ? current : (names[0] ?? "")));
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        setDatabases([]);
        setDatabaseToDrop("");
        setDatabasesError(error instanceof Error ? error.message : String(error));
      })
      .finally(() => {
        if (mounted) setDatabasesLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [containerReady, normalizedContainer, refreshSignal]);

  const submitCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!createReady || disabled) return;
    onCreate({ container: normalizedContainer, database: normalizedCreateDatabase });
  };

  const submitDrop = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dropReady || disabled) return;
    onDrop({ container: normalizedContainer, database: normalizedDropDatabase });
  };

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 shadow-sm shadow-black/15">
      <header className="mb-3">
        <span className="text-[11px] font-semibold uppercase text-teal-300/80">{copy.titleEyebrow}</span>
        <strong className="mt-1 block text-sm font-bold text-zinc-100">{copy.title}</strong>
      </header>

      <div className="grid gap-3 min-[1180px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <label className="grid gap-2 text-sm">
          <span className="text-xs font-semibold uppercase text-zinc-500">{copy.container}</span>
          <select
            className="h-10 min-w-0 rounded-lg border border-zinc-700/80 bg-zinc-950/72 px-3 text-sm text-zinc-100 outline-none transition focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/20 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled || instances.length === 0}
            value={containerValue}
            onChange={(event) => {
              setContainer(event.target.value);
              setDatabases([]);
              setDatabaseToDrop("");
              setDatabasesError(null);
            }}
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

        <div className="grid gap-2">
          <span className="text-xs font-semibold uppercase text-zinc-500">{copy.database}</span>
          <div className="grid gap-2 min-[720px]:grid-cols-[minmax(0,1fr)_auto]">
            <select
              className="h-10 min-w-0 rounded-lg border border-zinc-700/80 bg-zinc-950/72 px-3 text-sm text-zinc-100 outline-none transition focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/20 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled || !containerReady || databasesLoading || databases.length === 0}
              value={databaseToDrop}
              onChange={(event) => setDatabaseToDrop(event.target.value)}
            >
              <option value="">{databasesLoading ? copy.refresh : copy.emptyDatabases}</option>
              {databases.map((database) => (
                <option key={database} value={database}>
                  {database}
                </option>
              ))}
            </select>
            <Button
              disabled={disabled || !containerReady || databasesLoading}
              icon={<RefreshCw size={16} strokeWidth={2.4} />}
              loading={databasesLoading}
              type="button"
              onClick={refreshDatabases}
            >
              {copy.refresh}
            </Button>
          </div>
          {databasesError ? <span className="text-xs font-medium text-red-200">{databasesError}</span> : null}
        </div>
      </div>

      <div className="mt-3 grid gap-3 min-[1180px]:grid-cols-2">
        <form
          className="grid gap-3 min-[720px]:grid-cols-[minmax(0,1fr)_auto] min-[720px]:items-start"
          onSubmit={submitCreate}
        >
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
          <Button
            className="w-full min-[720px]:mt-6"
            disabled={!createReady || disabled}
            icon={<Plus size={17} strokeWidth={2.4} />}
            loading={loadingCreate}
            title={!createReady ? copy.validation.createDisabled : disabled ? disabledTitle : undefined}
            tone="primary"
            type="submit"
          >
            {copy.createAction}
          </Button>
        </form>

        <form className="flex min-w-0 items-end" onSubmit={submitDrop}>
          <Button
            className="w-full"
            disabled={!dropReady || disabled}
            icon={<Trash2 size={17} strokeWidth={2.4} />}
            loading={loadingDrop}
            title={!dropReady ? copy.validation.deleteDisabled : disabled ? disabledTitle : undefined}
            tone="danger"
            type="submit"
          >
            {copy.deleteAction}
          </Button>
        </form>
      </div>
    </section>
  );
}

function isValidDatabaseName(database: string) {
  return /^[A-Za-z0-9_$.-]+$/.test(database);
}

function instanceLabel(instance: MariaDbInstance) {
  return `MariaDB ${instance.version} / ${instance.container} / :${instance.hostPort}`;
}
