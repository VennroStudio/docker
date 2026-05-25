import { ChevronDown, Database, ExternalLink, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { DatabaseAction, InfoLine, ShellIconButton, StatusDot } from "@/entities/infrastructure";
import type { ServiceLink } from "@/entities/infrastructure";
import type { AppText } from "@/entities/infrastructure";
import type {
  CommandAction,
  MariaDbAuthMode,
  MariaDbInstance,
  MariaDbInstanceAction,
  MariaDbInstanceForm,
  PhpMyAdminOverview,
  ShellAction,
} from "@/entities/infrastructure";
import { Button } from "@/shared/ui";
import { Field } from "@/shared/ui";
import { Modal } from "@/shared/ui";
import { cn } from "@/shared/lib";

type MariaDbInstancesPanelProps = {
  error: string | null;
  instances: MariaDbInstance[];
  loading: boolean;
  phpmyadmin: PhpMyAdminOverview;
  phpmyadminActions: CommandAction[];
  phpmyadminLink?: ServiceLink;
  phpmyadminShell?: ShellAction;
  text: AppText;
  onCreate: (form: MariaDbInstanceForm) => void;
  onPhpMyAdminRun: (action: CommandAction) => void;
  onPhpMyAdminShellOpen: (action: ShellAction) => void;
  onRun: (instance: MariaDbInstance, action: MariaDbInstanceAction) => void;
  onShellOpen: (instance: MariaDbInstance) => void;
};

const initialForm: MariaDbInstanceForm = {
  authMode: "config",
  password: "",
  rootPassword: "",
  user: "root",
  version: "11.4",
};

const mariaDbVersions = ["10.6", "10.11", "11.4", "11.8", "12.1"];
const databaseActionOrder: MariaDbInstanceAction[] = ["up", "down", "start", "stop", "logs", "clean"];
const selectClass =
  "h-10 min-w-0 rounded-lg border border-zinc-700/80 bg-zinc-950/72 px-3 text-sm text-zinc-100 outline-none transition focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/20";

export function MariaDbInstancesPanel({
  error,
  instances,
  loading,
  onCreate,
  onPhpMyAdminRun,
  onPhpMyAdminShellOpen,
  onRun,
  onShellOpen,
  phpmyadmin,
  phpmyadminActions,
  phpmyadminLink,
  phpmyadminShell,
  text,
}: MariaDbInstancesPanelProps) {
  const [form, setForm] = useState(initialForm);
  const [createOpen, setCreateOpen] = useState(false);
  const [mariadbOpen, setMariaDbOpen] = useState(true);
  const [phpMyAdminOpen, setPhpMyAdminOpen] = useState(false);
  const copy = text.mariadbInstances;
  const phpActions = useMemo(() => actionsBySuffix(phpmyadminActions), [phpmyadminActions]);
  const createDisabled =
    !/^\d+(\.\d+){1,2}$/.test(form.version.trim()) ||
    !form.user.trim() ||
    !form.password.trim() ||
    !form.rootPassword.trim();

  const updateField = <Key extends keyof MariaDbInstanceForm>(key: Key, value: MariaDbInstanceForm[Key]) => {
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
          onClick={() => setMariaDbOpen((value) => !value)}
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
            className={cn("shrink-0 text-zinc-500 transition", mariadbOpen && "rotate-180 text-zinc-200")}
            size={18}
            strokeWidth={2.4}
          />
        </header>

        {mariadbOpen ? (
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
                          label={copy.actions[action].label}
                          onClick={() => onRun(instance, action)}
                        />
                      ))}
                      <ShellIconButton label={copy.actions.shell.label} onClick={() => onShellOpen(instance)} />
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
                {mariaDbVersions.map((version) => (
                  <option key={version} value={version}>
                    {version}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label={copy.fields.user}
              placeholder="app"
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
              label={copy.fields.rootPassword}
              type="password"
              value={form.rootPassword}
              onChange={(event) => updateField("rootPassword", event.target.value)}
            />
            <label className="grid gap-2 text-sm">
              <span className="text-xs font-semibold uppercase text-zinc-500">{copy.fields.authMode}</span>
              <select
                className={selectClass}
                value={form.authMode}
                onChange={(event) => updateField("authMode", event.target.value as MariaDbAuthMode)}
              >
                <option value="config">{copy.authModes.config}</option>
                <option value="cookie">{copy.authModes.cookie}</option>
              </select>
            </label>
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
          onClick={() => setPhpMyAdminOpen((value) => !value)}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase text-zinc-500">{copy.phpmyadminEyebrow}</span>
            <strong className="mt-1 block truncate text-base font-bold text-zinc-50">phpMyAdmin</strong>
          </span>
          <span
            className="flex shrink-0 flex-wrap items-center justify-end gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            <StatusDot state={phpmyadmin.state} />
            {phpmyadminLink ? (
              <a
                aria-label={phpmyadminLink.label}
                className="grid h-9 w-9 place-items-center rounded-lg border border-teal-300/30 bg-teal-400/10 text-teal-100 transition hover:border-teal-200/60 hover:bg-teal-400/18"
                href={phpmyadminLink.url}
                rel="noreferrer"
                target="_blank"
                title={phpmyadminLink.url}
              >
                <ExternalLink size={16} strokeWidth={2.5} />
              </a>
            ) : null}
            {(["up", "down", "start", "stop", "logs", "clean"] as const).map((action) => {
              const phpAction = phpActions[action];
              return phpAction ? (
                <DatabaseAction
                  key={action}
                  action={action}
                  label={phpAction.label}
                  onClick={() => onPhpMyAdminRun(phpAction)}
                />
              ) : null;
            })}
            {phpmyadminShell ? (
              <ShellIconButton
                label={copy.actions.shell.label}
                onClick={() => onPhpMyAdminShellOpen(phpmyadminShell)}
              />
            ) : null}
          </span>
          <ChevronDown
            className={cn("shrink-0 text-zinc-500 transition", phpMyAdminOpen && "rotate-180 text-zinc-200")}
            size={18}
            strokeWidth={2.4}
          />
        </header>

        {phpMyAdminOpen ? (
          <div className="grid gap-2 border-t border-zinc-800 p-4 sm:grid-cols-2">
            <InfoLine label={copy.containerLabel} value={phpmyadmin.container} />
            <InfoLine label={copy.domainLabel} value={phpmyadmin.domain || copy.domainUnknown} />
            {phpmyadminLink ? (
              <InfoLine href={phpmyadminLink.url} label={text.common.link} value={phpmyadminLink.url} />
            ) : null}
            {phpmyadmin.status ? <InfoLine label={copy.statusLabel} value={phpmyadmin.status} /> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function actionsBySuffix(actions: CommandAction[]) {
  return Object.fromEntries(actions.map((action) => [action.id.split(":")[1], action])) as Partial<
    Record<MariaDbInstanceAction, CommandAction>
  >;
}
