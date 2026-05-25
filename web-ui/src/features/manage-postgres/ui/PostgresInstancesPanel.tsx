import { ChevronDown, Database, ExternalLink, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { DatabaseAction, InfoLine, ShellIconButton, StatusDot } from "@/entities/infrastructure";
import type { ServiceLink } from "@/entities/infrastructure";
import type { AppText } from "@/entities/infrastructure";
import type {
  CommandAction,
  PgAdminOverview,
  PostgresInstance,
  PostgresInstanceAction,
  PostgresInstanceForm,
  ShellAction,
} from "@/entities/infrastructure";
import { Button } from "@/shared/ui";
import { Field } from "@/shared/ui";
import { Modal } from "@/shared/ui";
import { cn } from "@/shared/lib";

type PostgresInstancesPanelProps = {
  error: string | null;
  instances: PostgresInstance[];
  loading: boolean;
  pgadmin: PgAdminOverview;
  pgadminActions: CommandAction[];
  pgadminLink?: ServiceLink;
  pgadminShell?: ShellAction;
  text: AppText;
  onCreate: (form: PostgresInstanceForm) => void;
  onPgAdminRun: (action: CommandAction) => void;
  onPgAdminShellOpen: (action: ShellAction) => void;
  onRun: (instance: PostgresInstance, action: PostgresInstanceAction) => void;
  onShellOpen: (instance: PostgresInstance) => void;
};

const initialForm: PostgresInstanceForm = {
  database: "app",
  password: "",
  user: "postgres",
  version: "17",
};

const postgresVersions = ["14", "15", "16", "17", "18"];
const databaseActionOrder: PostgresInstanceAction[] = ["up", "down", "start", "stop", "logs", "clean"];
const selectClass =
  "h-10 min-w-0 rounded-lg border border-zinc-700/80 bg-zinc-950/72 px-3 text-sm text-zinc-100 outline-none transition focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/20";

export function PostgresInstancesPanel({
  error,
  instances,
  loading,
  onCreate,
  onPgAdminRun,
  onPgAdminShellOpen,
  onRun,
  onShellOpen,
  pgadmin,
  pgadminActions,
  pgadminLink,
  pgadminShell,
  text,
}: PostgresInstancesPanelProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [pgAdminOpen, setPgAdminOpen] = useState(false);
  const [postgresOpen, setPostgresOpen] = useState(true);
  const copy = text.postgresInstances;
  const pgActions = useMemo(() => actionsBySuffix(pgadminActions), [pgadminActions]);
  const createDisabled = !form.version.trim() || !form.user.trim() || !form.password.trim() || !form.database.trim();

  const updateField = <Key extends keyof PostgresInstanceForm>(key: Key, value: PostgresInstanceForm[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const createInstance = () => {
    onCreate(form);
    setCreateOpen(false);
  };

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-lg border border-zinc-800/90 bg-zinc-950/54 shadow-sm shadow-black/20">
        <header
          className="flex cursor-pointer items-center gap-4 px-4 py-3 transition hover:bg-white/[0.03]"
          onClick={() => setPostgresOpen((value) => !value)}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase text-zinc-500">{copy.titleEyebrow}</span>
            <strong className="mt-1 block truncate text-base font-bold text-zinc-50">{copy.title}</strong>
          </span>
          <span
            className="flex shrink-0 flex-wrap items-center justify-end gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs font-bold text-zinc-400">
              {instances.length}
            </span>
            <Button
              className="min-h-9 px-3 py-1.5"
              icon={<Plus size={15} strokeWidth={2.6} />}
              tone="primary"
              type="button"
              onClick={() => setCreateOpen(true)}
            >
              {copy.addVersion}
            </Button>
          </span>
          <ChevronDown
            className={cn("shrink-0 text-zinc-500 transition", postgresOpen && "rotate-180 text-zinc-200")}
            size={18}
            strokeWidth={2.4}
          />
        </header>

        {postgresOpen ? (
          <div className="border-t border-zinc-800 p-4">
            <div>
              <h3 className="mb-3 text-sm font-bold text-zinc-200">{copy.serversTitle}</h3>
              <div className="grid gap-3">
                {loading ? <p className="text-sm text-zinc-500">{copy.loading}</p> : null}
                {error ? (
                  <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                    {copy.error}: {error}
                  </p>
                ) : null}
                {!loading && !error && instances.length === 0 ? (
                  <p className="rounded-lg border border-zinc-800 bg-zinc-900/45 px-3 py-2 text-sm text-zinc-500">
                    {copy.empty}
                  </p>
                ) : null}

                {instances.map((instance) => (
                  <article
                    className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3"
                    key={instance.name}
                  >
                    <StatusDot state={instance.state} />
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-bold text-zinc-50">
                        {copy.instanceTitle(instance.version)}
                      </h4>
                      <p className="truncate text-xs text-zinc-500">{instance.container}</p>
                      <span className="mt-1 inline-flex rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[11px] font-semibold text-zinc-400">
                        {copy.portLabel}: {instance.hostPort}
                      </span>
                    </div>
                    <div className="flex shrink-0 flex-wrap justify-end gap-2">
                      {databaseActionOrder.map((action) => (
                        <DatabaseAction
                          key={action}
                          action={action}
                          label={text.mariadbInstances.actions[action].label}
                          onClick={() => onRun(instance, action)}
                        />
                      ))}
                      <ShellIconButton
                        label={text.mariadbInstances.actions.shell.label}
                        onClick={() => onShellOpen(instance)}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {createOpen ? (
        <Modal title={copy.createTitle} onClose={() => setCreateOpen(false)}>
          <div className="grid gap-3">
            <label className="grid gap-2 text-sm">
              <span className="text-xs font-semibold uppercase text-zinc-500">{copy.fields.version}</span>
              <select
                className={selectClass}
                value={form.version}
                onChange={(event) => updateField("version", event.target.value)}
              >
                {postgresVersions.map((version) => (
                  <option key={version} value={version}>
                    {version}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label={copy.fields.user}
              value={form.user}
              onChange={(event) => updateField("user", event.target.value)}
            />
            <Field
              label={copy.fields.password}
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
            />
            <Field
              label={copy.fields.database}
              value={form.database}
              onChange={(event) => updateField("database", event.target.value)}
            />
            <Button
              className="mt-2 w-full"
              disabled={createDisabled}
              icon={<Database size={17} strokeWidth={2.4} />}
              tone="primary"
              type="button"
              onClick={createInstance}
            >
              {copy.create}
            </Button>
          </div>
        </Modal>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-zinc-800/90 bg-zinc-950/54 shadow-sm shadow-black/20">
        <header
          className="flex cursor-pointer items-center gap-4 px-4 py-3 transition hover:bg-white/[0.03]"
          onClick={() => setPgAdminOpen((value) => !value)}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase text-zinc-500">{copy.pgadminEyebrow}</span>
            <strong className="mt-1 block truncate text-base font-bold text-zinc-50">pgAdmin</strong>
          </span>
          <span
            className="flex shrink-0 flex-wrap items-center justify-end gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            <StatusDot state={pgadmin.state} />
            {pgadminLink ? (
              <a
                aria-label={pgadminLink.label}
                className="grid h-9 w-9 place-items-center rounded-lg border border-teal-300/30 bg-teal-400/10 text-teal-100 transition hover:border-teal-200/60 hover:bg-teal-400/18"
                href={pgadminLink.url}
                rel="noreferrer"
                target="_blank"
                title={pgadminLink.url}
              >
                <ExternalLink size={16} strokeWidth={2.5} />
              </a>
            ) : null}
            {databaseActionOrder.map((action) => {
              const pgAction = pgActions[action];
              return pgAction ? (
                <DatabaseAction
                  key={action}
                  action={action}
                  label={pgAction.label}
                  onClick={() => onPgAdminRun(pgAction)}
                />
              ) : null;
            })}
            {pgadminShell ? (
              <ShellIconButton
                label={text.mariadbInstances.actions.shell.label}
                onClick={() => onPgAdminShellOpen(pgadminShell)}
              />
            ) : null}
          </span>
          <ChevronDown
            className={cn("shrink-0 text-zinc-500 transition", pgAdminOpen && "rotate-180 text-zinc-200")}
            size={18}
            strokeWidth={2.4}
          />
        </header>

        {pgAdminOpen ? (
          <div className="grid gap-2 border-t border-zinc-800 p-4 sm:grid-cols-2">
            <InfoLine label={copy.containerLabel} value={pgadmin.container} />
            <InfoLine label={copy.domainLabel} value={pgadmin.domain || copy.domainUnknown} />
            {pgadminLink ? <InfoLine href={pgadminLink.url} label={text.common.link} value={pgadminLink.url} /> : null}
            {pgadmin.status ? <InfoLine label={copy.statusLabel} value={pgadmin.status} /> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function actionsBySuffix(actions: CommandAction[]) {
  return Object.fromEntries(actions.map((action) => [action.id.split(":")[1], action])) as Partial<
    Record<PostgresInstanceAction, CommandAction>
  >;
}
