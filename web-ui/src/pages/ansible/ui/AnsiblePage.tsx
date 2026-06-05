import { Hammer, Play, Plus, Save, Trash2 } from "lucide-react";
import { Suspense, lazy, useMemo, useState } from "react";
import type { AppText, ViewConfig, useAnsible, useSshServers } from "@/entities/infrastructure";
import { Button, Modal, Panel, SelectField } from "@/shared/ui";
import { ServicePageLayout } from "@/widgets/service-page-layout";

type VariableRow = {
  id: number;
  parameter: string;
  value: string;
};

type AnsiblePageProps = {
  activeOperationKey?: null | string;
  ansibleState: ReturnType<typeof useAnsible>;
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  sshServers: ReturnType<typeof useSshServers>;
  text: AppText;
  view: ViewConfig;
  onBuild: () => void;
  onClean: () => void;
  onSetup: (serverId: string) => void;
};

const CodeEditor = lazy(() => import("@/shared/ui/CodeEditor").then((module) => ({ default: module.CodeEditor })));

export function AnsiblePage({
  activeOperationKey,
  ansibleState,
  onBuild,
  onClean,
  onSetup,
  operationDisabled = false,
  operationDisabledTitle,
  sshServers,
  text,
  view,
}: AnsiblePageProps) {
  const copy = text.ansible;
  const [serverId, setServerId] = useState("");
  const [configError, setConfigError] = useState("");
  const [message, setMessage] = useState("");
  const [variablesOpen, setVariablesOpen] = useState(false);
  const [variableRows, setVariableRows] = useState<VariableRow[]>([]);
  const selectedServerId = serverId || (sshServers.servers[0] ? String(sshServers.servers[0].id) : "");
  const variables = Object.entries(ansibleState.state?.config || {});

  const serverOptions = useMemo(
    () => [
      { label: sshServers.servers.length ? copy.validation.server : copy.emptyServers, value: "" },
      ...sshServers.servers.map((server) => ({
        label: `${server.name} (${server.user}@${server.host}:${server.port})`,
        value: String(server.id),
      })),
    ],
    [copy.emptyServers, copy.validation.server, sshServers.servers],
  );

  const runDisabled = operationDisabled || !selectedServerId;
  const setupTitle = !selectedServerId ? copy.validation.server : operationDisabledTitle;

  const openVariables = () => {
    setConfigError("");
    setMessage("");
    setVariableRows(rowsFromConfig(ansibleState.state?.config || {}));
    setVariablesOpen(true);
  };

  const addVariableRow = () => {
    setVariableRows((rows) => [...rows, emptyRow()]);
  };

  const updateVariableRow = (id: number, field: "parameter" | "value", value: string) => {
    setVariableRows((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const removeVariableRow = (id: number) => {
    setVariableRows((rows) => {
      const nextRows = rows.filter((row) => row.id !== id);
      return nextRows.length > 0 ? nextRows : [emptyRow()];
    });
  };

  const saveVariables = async () => {
    setConfigError("");
    setMessage("");

    const nextConfig: Record<string, string> = {};
    const used = new Set<string>();

    for (const row of variableRows) {
      const parameter = row.parameter.trim();
      if (!parameter) continue;
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(parameter)) {
        setConfigError(copy.validation.parameter);
        return;
      }
      if (used.has(parameter)) {
        setConfigError(copy.validation.duplicateVariable(parameter));
        return;
      }

      used.add(parameter);
      nextConfig[parameter] = row.value;
    }

    const ok = await ansibleState.saveConfig(nextConfig);
    if (!ok) return;

    setVariablesOpen(false);
    setMessage(copy.messages.configSaved);
  };

  const savePlaybook = async () => {
    setMessage("");
    const ok = await ansibleState.savePlaybook(ansibleState.playbookText);
    if (ok) setMessage(copy.messages.playbookSaved);
  };

  return (
    <ServicePageLayout view={view} eyebrow={copy.runEyebrow} title={copy.title} description={copy.description}>
      <div className="grid gap-4">
        <Panel eyebrow={copy.runEyebrow} title={copy.runTitle}>
          <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_auto] lg:items-end">
            <SelectField
              label={copy.fields.server}
              options={serverOptions}
              value={selectedServerId}
              onChange={(event) => setServerId(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={operationDisabled}
                icon={<Hammer size={17} strokeWidth={2.4} />}
                loading={activeOperationKey === "ansible:build"}
                title={operationDisabledTitle}
                onClick={onBuild}
              >
                {copy.actions.build}
              </Button>
              <Button
                disabled={runDisabled}
                icon={<Play size={17} strokeWidth={2.4} />}
                loading={activeOperationKey === `ansible:setup:${selectedServerId}`}
                title={setupTitle}
                tone="primary"
                onClick={() => onSetup(selectedServerId)}
              >
                {copy.actions.setup}
              </Button>
              <Button
                disabled={operationDisabled}
                icon={<Trash2 size={17} strokeWidth={2.4} />}
                loading={activeOperationKey === "ansible:clean"}
                title={operationDisabledTitle}
                tone="danger"
                onClick={onClean}
              >
                {copy.actions.clean}
              </Button>
            </div>
          </div>
        </Panel>

        {ansibleState.loading ? (
          <section className="rounded-lg border border-sky-100/90 bg-white/76 p-4 shadow-[0_14px_34px_rgba(14,165,233,0.12)]">
            <p className="text-sm font-semibold text-slate-500">{copy.loading}</p>
          </section>
        ) : null}

        {ansibleState.error ? <p className="text-sm font-semibold text-red-600">{ansibleState.error}</p> : null}
        {sshServers.error ? <p className="text-sm font-semibold text-red-600">{sshServers.error}</p> : null}
        {message ? <p className="text-sm font-semibold text-teal-700">{message}</p> : null}

        <Panel
          eyebrow={copy.configEyebrow}
          title={copy.configTitle}
          badge={ansibleState.state?.configExists ? "config/ansible.json" : undefined}
        >
          {ansibleState.state?.configExists ? (
            variables.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-sky-100 bg-white shadow-[0_5px_14px_rgba(15,23,42,0.08)]">
                <div className="grid grid-cols-[minmax(160px,0.8fr)_minmax(180px,1.2fr)] border-b border-sky-100 bg-sky-50/70 px-3 py-2 text-xs font-bold uppercase text-slate-500">
                  <span>{copy.fields.parameter}</span>
                  <span>{copy.fields.value}</span>
                </div>
                {variables.map(([parameter, value]) => (
                  <div
                    key={parameter}
                    className="grid grid-cols-[minmax(160px,0.8fr)_minmax(180px,1.2fr)] border-b border-sky-50 px-3 py-2 text-sm last:border-b-0"
                  >
                    <span className="min-w-0 truncate font-semibold text-slate-800">{parameter}</span>
                    <span className="min-w-0 truncate font-mono text-xs text-slate-500">{String(value ?? "")}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-500">{copy.variablesEmpty}</p>
            )
          ) : (
            <p className="text-sm font-semibold text-slate-500">
              {ansibleState.state?.configError || copy.variablesMissing}
            </p>
          )}
          {configError ? <p className="mt-2 text-sm font-semibold text-red-600">{configError}</p> : null}
          <div className="mt-3 flex justify-end">
            <Button
              icon={<Plus size={17} strokeWidth={2.4} />}
              disabled={!ansibleState.state?.configExists}
              loading={ansibleState.saving}
              tone="primary"
              onClick={openVariables}
            >
              {copy.actions.addVariable}
            </Button>
          </div>
        </Panel>

        <Panel
          eyebrow={copy.deployEyebrow}
          title={copy.deployTitle}
          badge={ansibleState.state ? "deploy.yml" : undefined}
        >
          <Suspense
            fallback={
              <div className="grid min-h-[560px] place-items-center rounded-lg border border-teal-300/80 bg-slate-950 text-sm font-semibold text-slate-400 shadow-[0_16px_38px_rgba(15,23,42,0.18),0_0_0_1px_rgba(20,184,166,0.20)] ring-2 ring-teal-100/70">
                {copy.loading}
              </div>
            }
          >
            <CodeEditor
              ariaLabel={copy.deployTitle}
              maxHeight={720}
              minHeight={560}
              value={ansibleState.playbookText}
              onChange={ansibleState.setPlaybookText}
            />
          </Suspense>
          <div className="mt-3 flex justify-end">
            <Button
              icon={<Save size={17} strokeWidth={2.4} />}
              disabled={!ansibleState.state}
              loading={ansibleState.saving}
              tone="primary"
              onClick={() => void savePlaybook()}
            >
              {copy.actions.savePlaybook}
            </Button>
          </div>
        </Panel>
      </div>

      {variablesOpen ? (
        <Modal title={copy.variablesModalTitle} onClose={() => setVariablesOpen(false)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="grid grid-cols-[minmax(130px,0.8fr)_minmax(150px,1.2fr)_40px] gap-2 px-1 text-xs font-bold uppercase text-slate-500">
                <span>{copy.fields.parameter}</span>
                <span>{copy.fields.value}</span>
                <span />
              </div>
              {variableRows.map((row) => (
                <div key={row.id} className="grid grid-cols-[minmax(130px,0.8fr)_minmax(150px,1.2fr)_40px] gap-2">
                  <input
                    className="h-10 min-w-0 rounded-lg border border-sky-100 bg-white px-3 text-sm font-semibold text-slate-950 shadow-[0_5px_14px_rgba(15,23,42,0.08)] outline-none transition placeholder:text-slate-400 focus:border-teal-500/70 focus:ring-2 focus:ring-teal-100"
                    placeholder="DOCKERHUB_USERNAME"
                    value={row.parameter}
                    onChange={(event) => updateVariableRow(row.id, "parameter", event.target.value)}
                  />
                  <input
                    className="h-10 min-w-0 rounded-lg border border-sky-100 bg-white px-3 text-sm text-slate-950 shadow-[0_5px_14px_rgba(15,23,42,0.08)] outline-none transition placeholder:text-slate-400 focus:border-teal-500/70 focus:ring-2 focus:ring-teal-100"
                    placeholder="vennro"
                    value={row.value}
                    onChange={(event) => updateVariableRow(row.id, "value", event.target.value)}
                  />
                  <button
                    aria-label={copy.actions.deleteRow}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-red-200 bg-red-50 text-red-600 shadow-[0_5px_14px_rgba(249,115,22,0.12)] transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={variableRows.length === 1 && !row.parameter && !row.value}
                    type="button"
                    onClick={() => removeVariableRow(row.id)}
                  >
                    <Trash2 size={16} strokeWidth={2.4} />
                  </button>
                </div>
              ))}
            </div>
            {configError ? <p className="text-sm font-semibold text-red-600">{configError}</p> : null}
            <div className="flex flex-wrap justify-between gap-2">
              <Button icon={<Plus size={17} strokeWidth={2.4} />} onClick={addVariableRow}>
                {copy.actions.addRow}
              </Button>
              <Button
                icon={<Save size={17} strokeWidth={2.4} />}
                loading={ansibleState.saving}
                tone="primary"
                onClick={() => void saveVariables()}
              >
                {copy.actions.saveVariables}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </ServicePageLayout>
  );
}

function rowsFromConfig(config: Record<string, boolean | null | number | string>) {
  const rows = Object.entries(config).map(([parameter, value]) => ({
    id: Date.now() + Math.random(),
    parameter,
    value: String(value ?? ""),
  }));

  return rows.length > 0 ? rows : [emptyRow()];
}

function emptyRow(): VariableRow {
  return {
    id: Date.now() + Math.random(),
    parameter: "",
    value: "",
  };
}
