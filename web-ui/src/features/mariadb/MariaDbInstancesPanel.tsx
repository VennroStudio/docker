import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Database,
  ExternalLink,
  ListTree,
  Play,
  Square,
  TerminalSquare,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { ServiceLink } from "../../shared/api/links";
import type { AppText } from "../../shared/i18n";
import type {
  CommandAction,
  ContainerRuntimeState,
  MariaDbAuthMode,
  MariaDbInstance,
  MariaDbInstanceAction,
  MariaDbInstanceForm,
  PhpMyAdminOverview,
  ShellAction,
} from "../../shared/types/commands";
import { Button } from "../../shared/ui/Button";
import { Field } from "../../shared/ui/Field";

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
  port: "",
  rootPassword: "",
  user: "root",
  version: "11.4",
};

const mariaDbVersions = ["10.6", "10.11", "11.4", "11.8", "12.1"];
const mariadbActionOrder: MariaDbInstanceAction[] = ["up", "down", "start", "stop", "logs", "clean"];
const actionIcon = {
  clean: <Trash2 size={16} strokeWidth={2.5} />,
  down: <ArrowDown size={16} strokeWidth={2.7} />,
  logs: <ListTree size={16} strokeWidth={2.4} />,
  shell: <TerminalSquare size={16} strokeWidth={2.4} />,
  start: <Play size={16} strokeWidth={2.6} />,
  stop: <Square size={15} strokeWidth={2.6} />,
  up: <ArrowUp size={16} strokeWidth={2.7} />,
};

const actionTone = {
  clean: "danger",
  down: "danger",
  logs: "default",
  shell: "primary",
  start: "default",
  stop: "danger",
  up: "success",
} as const;

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

  return (
    <div className="mariadb-accordions">
      <section className={`infra-accordion ${mariadbOpen ? "is-open" : ""}`}>
        <header className="infra-accordion-head">
          <button className="accordion-toggle" type="button" onClick={() => setMariaDbOpen((value) => !value)}>
            <span className="accordion-title-block">
              <span className="accordion-eyebrow">{copy.titleEyebrow}</span>
              <strong>{copy.title}</strong>
            </span>
            <span className="accordion-head-side">
              <span className="panel-badge">{instances.length}</span>
              <ChevronDown size={18} strokeWidth={2.4} />
            </span>
          </button>
        </header>

        {mariadbOpen ? (
          <div className="infra-accordion-body mariadb-compose-grid">
            <div className="mariadb-compose-card">
              <h3>{copy.createTitle}</h3>
              <div className="mariadb-instance-form compact">
                <label className="field">
                  <span>{copy.fields.version}</span>
                  <select
                    className="select-control"
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
                <label className="field">
                  <span>{copy.fields.authMode}</span>
                  <select
                    className="select-control"
                    value={form.authMode}
                    onChange={(event) => updateField("authMode", event.target.value as MariaDbAuthMode)}
                  >
                    <option value="config">{copy.authModes.config}</option>
                    <option value="cookie">{copy.authModes.cookie}</option>
                  </select>
                </label>
                <Button
                  className="mariadb-create-button"
                  disabled={createDisabled}
                  icon={<Database size={17} strokeWidth={2.4} />}
                  tone="primary"
                  type="button"
                  onClick={() => onCreate(form)}
                >
                  {copy.create}
                </Button>
              </div>
            </div>

            <div className="mariadb-servers-card">
              <h3>{copy.serversTitle}</h3>
              <div className="mariadb-instance-list compact">
                {loading ? <p className="muted-line">{copy.loading}</p> : null}
                {error ? (
                  <p className="error-line">
                    {copy.error}: {error}
                  </p>
                ) : null}
                {!loading && !error && instances.length === 0 ? <p className="muted-line">{copy.empty}</p> : null}

                {instances.map((instance) => (
                  <article className="mariadb-server-item" key={instance.name}>
                    <StatusDot state={instance.state} />
                    <div className="mariadb-server-main">
                      <h4>{copy.instanceTitle(instance.version)}</h4>
                      <p>{instance.container}</p>
                      <span>
                        {copy.portLabel}: {instance.hostPort}
                      </span>
                    </div>
                    <div className="icon-action-row">
                      {mariadbActionOrder.map((action) => (
                        <IconAction
                          key={action}
                          label={copy.actions[action].label}
                          tone={actionTone[action]}
                          onClick={() => onRun(instance, action)}
                        >
                          {actionIcon[action]}
                        </IconAction>
                      ))}
                      <IconAction label={copy.actions.shell.label} tone="primary" onClick={() => onShellOpen(instance)}>
                        {actionIcon.shell}
                      </IconAction>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className={`infra-accordion ${phpMyAdminOpen ? "is-open" : ""}`}>
        <header className="infra-accordion-head phpmyadmin-head" onClick={() => setPhpMyAdminOpen((value) => !value)}>
          <span className="accordion-toggle compact">
            <span className="accordion-title-block">
              <span className="accordion-eyebrow">{copy.phpmyadminEyebrow}</span>
              <strong>phpMyAdmin</strong>
            </span>
          </span>
          <span className="accordion-head-actions" onClick={(event) => event.stopPropagation()}>
            <StatusDot state={phpmyadmin.state} />
            {phpmyadminLink ? (
              <a
                aria-label={phpmyadminLink.label}
                className="icon-action icon-action-primary"
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
                <IconAction
                  key={action}
                  label={phpAction.label}
                  tone={actionTone[action]}
                  onClick={() => onPhpMyAdminRun(phpAction)}
                >
                  {actionIcon[action]}
                </IconAction>
              ) : null;
            })}
            {phpmyadminShell ? (
              <IconAction
                label={copy.actions.shell.label}
                tone="primary"
                onClick={() => onPhpMyAdminShellOpen(phpmyadminShell)}
              >
                {actionIcon.shell}
              </IconAction>
            ) : null}
          </span>
          <ChevronDown className="accordion-chevron" size={18} strokeWidth={2.4} />
        </header>

        {phpMyAdminOpen ? (
          <div className="infra-accordion-body phpmyadmin-details">
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

function IconAction({
  children,
  label,
  onClick,
  tone,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  tone: "danger" | "default" | "primary" | "success";
}) {
  return (
    <button className={`icon-action icon-action-${tone}`} title={label} type="button" onClick={onClick}>
      {children}
    </button>
  );
}

function StatusDot({ state }: { state: ContainerRuntimeState }) {
  return <span className={`status-dot status-dot-${state}`} title={state} />;
}

function InfoLine({ href, label, value }: { href?: string; label: string; value: string }) {
  return (
    <div className="info-line">
      <span>{label}</span>
      {href ? (
        <a href={href} rel="noreferrer" target="_blank">
          {value}
        </a>
      ) : (
        <strong>{value}</strong>
      )}
    </div>
  );
}

function actionsBySuffix(actions: CommandAction[]) {
  return Object.fromEntries(actions.map((action) => [action.id.split(":")[1], action])) as Partial<
    Record<MariaDbInstanceAction, CommandAction>
  >;
}
