import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CommandPanel } from "../features/commands/CommandPanel";
import { ServiceControlPanel } from "../features/commands/ServiceControlPanel";
import { ShellPanel } from "../features/shell/ShellPanel";
import { useServiceStatuses } from "../features/status/model/useServiceStatuses";
import { useCommandStream } from "../features/terminal/model/useCommandStream";
import { HomePage } from "../pages/home/HomePage";
import { NpmPage } from "../pages/npm/NpmPage";
import { commandPageRegistry, proxyShells, type CommandPageId } from "../pages/service/model/pageRegistry";
import { ServicePage } from "../pages/service/ServicePage";
import { streamCommand, streamHost, streamProxy, streamProxyDelete, streamShell } from "../shared/api/stream";
import {
  mariadbActions,
  networkActions,
  nginxActions,
  pgadminActions,
  phpmyadminActions,
  postgresActions,
  redisActions,
  redisinsightActions,
} from "../shared/config/actions";
import { getViewById, getViewByPath } from "../shared/config/views";
import { dictionaries } from "../shared/i18n";
import { useConfirmDialog } from "../shared/model/useConfirmDialog";
import { useAppMeta } from "../shared/model/useAppMeta";
import { useLanguage } from "../shared/model/useLanguage";
import type { CommandAction, ProxyFormState, ShellAction, ViewId } from "../shared/types/commands";
import { commandPreview, hostPreview, proxyDeletePreview, proxyPreview } from "../shared/utils/commandPreview";
import { AppShell } from "../widgets/app-shell/AppShell";
import { Workspace } from "../widgets/workspace/Workspace";

const initialProxyForm: ProxyFormState = {
  domain: "pma.local",
  target: "phpmyadmin-container",
  port: "80",
  ssl: false,
};

export function App() {
  const { language, toggleLanguage } = useLanguage();
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [proxyForm, setProxyForm] = useState(initialProxyForm);
  const commandStream = useCommandStream();
  const confirmDialog = useConfirmDialog();
  const appMeta = useAppMeta();
  const location = useLocation();
  const navigate = useNavigate();
  const activeConfig = getViewByPath(location.pathname);
  const activeView = activeConfig.id;
  const serviceStatuses = useServiceStatuses({ enabled: activeView === "home" });
  const text = dictionaries[language];

  const toggleTerminal = () => setTerminalOpen((value) => !value);
  const translateActions = (actions: CommandAction[]) =>
    actions.map((action) => ({
      ...action,
      ...text.actions[action.id],
    }));
  const translateShells = (actions: ShellAction[]) =>
    actions.map((action) => ({
      ...action,
      detail: text.shell.detail(action.container),
      label: text.shell.openLabel(action.label),
    }));

  const runWithTerminal = (preview: string, open: Parameters<typeof commandStream.run>[1]) => {
    setTerminalOpen(true);
    commandStream.run(preview, open, { onSettled: serviceStatuses.refresh });
  };

  const selectView = (view: ViewId) => {
    navigate(getViewById(view).path);
  };

  const runCommand = async (action: CommandAction) => {
    if (action.confirm) {
      const confirmed = await confirmDialog.confirm({
        body: text.confirm.runCommand.body(commandPreview(action.id)),
        confirmLabel: text.confirm.runCommand.confirmLabel,
        title: action.label,
        tone: "danger",
      });
      if (!confirmed) return;
    }

    runWithTerminal(commandPreview(action.id), (handlers) => streamCommand(action.id, handlers));
  };

  const runProxy = () => {
    runWithTerminal(proxyPreview(proxyForm), (handlers) => streamProxy(proxyForm, handlers));
  };

  const runProxyDelete = async () => {
    const confirmed = await confirmDialog.confirm({
      body: text.confirm.deleteProxy.body(proxyForm.domain),
      confirmLabel: text.confirm.deleteProxy.confirmLabel,
      title: text.confirm.deleteProxy.title,
      tone: "danger",
    });
    if (!confirmed) return;

    runWithTerminal(proxyDeletePreview(proxyForm.domain), (handlers) => streamProxyDelete(proxyForm.domain, handlers));
  };

  const runHost = async (action: "add" | "remove") => {
    if (action === "remove") {
      const confirmed = await confirmDialog.confirm({
        body: text.confirm.deleteHost.body(proxyForm.domain),
        confirmLabel: text.confirm.deleteHost.confirmLabel,
        title: text.confirm.deleteHost.title,
        tone: "danger",
      });
      if (!confirmed) return;
    }

    runWithTerminal(hostPreview(action, proxyForm.domain), (handlers) =>
      streamHost(action, proxyForm.domain, handlers),
    );
  };

  const runShell = (action: ShellAction) => {
    runWithTerminal(`docker exec -i ${action.container} sh`, (handlers) => streamShell(action.container, handlers));
  };

  return (
    <>
      <AppShell
        activeView={activeView}
        language={language}
        text={text}
        onSelectView={selectView}
        onToggleLanguage={toggleLanguage}
      >
        <Workspace
          output={commandStream.output}
          pageTitle={text.views[activeView]}
          streamState={commandStream.streamState}
          terminalActionLabels={{
            clear: text.common.clear,
            hide: text.common.hide,
            inputPlaceholder: text.shell.inputPlaceholder,
            stop: text.common.stop,
          }}
          terminalCwd={appMeta.projectRoot}
          terminalLabel={text.common.terminal}
          terminalOpen={terminalOpen}
          terminalTitle={appMeta.projectName}
          view={activeConfig}
          onClear={commandStream.clear}
          onInput={commandStream.sendInput}
          onStop={commandStream.stop}
          onToggleTerminal={toggleTerminal}
          terminalInputEnabled={commandStream.inputEnabled}
          terminalPrompt={commandStream.prompt}
        >
          {renderPage()}
        </Workspace>
      </AppShell>
      {confirmDialog.dialog}
    </>
  );

  function renderPage() {
    if (activeView === "home") {
      return <HomePage statuses={serviceStatuses.statuses} text={text} onOpenView={selectView} />;
    }

    if (activeView === "proxy") {
      return (
        <NpmPage
          networkActions={translateActions(networkActions)}
          nginxActions={translateActions(nginxActions)}
          shellActions={translateShells(proxyShells)}
          text={text}
          value={proxyForm}
          view={activeConfig}
          onChange={setProxyForm}
          onCreateProxy={runProxy}
          onHostAdd={() => runHost("add")}
          onHostRemove={() => runHost("remove")}
          onProxyDelete={runProxyDelete}
          onRunCommand={runCommand}
          onShellOpen={runShell}
        />
      );
    }

    if (activeView === "mariadb") {
      const page = text.servicePages.mariadb;
      const shells = translateShells(commandPageRegistry.mariadb.shells || []);

      return (
        <ServicePage view={activeConfig} eyebrow={page.eyebrow} description={page.description}>
          <div className="service-split-grid">
            <ServiceControlPanel
              actions={translateActions(mariadbActions)}
              eyebrow={text.panels.serviceControl.database}
              shell={shells.find((shell) => shell.container === "mariadb-container")}
              title="MariaDB"
              onRun={runCommand}
              onShellOpen={runShell}
            />
            <ServiceControlPanel
              actions={translateActions(phpmyadminActions)}
              eyebrow={text.panels.serviceControl.adminPanel}
              shell={shells.find((shell) => shell.container === "phpmyadmin-container")}
              title="phpMyAdmin"
              onRun={runCommand}
              onShellOpen={runShell}
            />
          </div>
        </ServicePage>
      );
    }

    if (activeView === "postgres") {
      const page = text.servicePages.postgres;
      const shells = translateShells(commandPageRegistry.postgres.shells || []);

      return (
        <ServicePage view={activeConfig} eyebrow={page.eyebrow} description={page.description}>
          <div className="service-split-grid">
            <ServiceControlPanel
              actions={translateActions(postgresActions)}
              eyebrow={text.panels.serviceControl.database}
              shell={shells.find((shell) => shell.container === "postgres-container")}
              title="Postgres"
              onRun={runCommand}
              onShellOpen={runShell}
            />
            <ServiceControlPanel
              actions={translateActions(pgadminActions)}
              eyebrow={text.panels.serviceControl.adminPanel}
              shell={shells.find((shell) => shell.container === "pgadmin-container")}
              title="pgAdmin"
              onRun={runCommand}
              onShellOpen={runShell}
            />
          </div>
        </ServicePage>
      );
    }

    if (activeView === "redis") {
      const page = text.servicePages.redis;
      const shells = translateShells(commandPageRegistry.redis.shells || []);

      return (
        <ServicePage view={activeConfig} eyebrow={page.eyebrow} description={page.description}>
          <div className="service-split-grid">
            <ServiceControlPanel
              actions={translateActions(redisActions)}
              eyebrow={text.panels.serviceControl.cache}
              shell={shells.find((shell) => shell.container === "redis-container")}
              title="Redis"
              onRun={runCommand}
              onShellOpen={runShell}
            />
            <ServiceControlPanel
              actions={translateActions(redisinsightActions)}
              eyebrow={text.panels.serviceControl.interface}
              shell={shells.find((shell) => shell.container === "redisinsight-container")}
              title="RedisInsight"
              onRun={runCommand}
              onShellOpen={runShell}
            />
          </div>
        </ServicePage>
      );
    }

    const commandPage = commandPageRegistry[activeView as CommandPageId];
    const page = text.servicePages[activeView as CommandPageId];

    if (commandPage && page) {
      return (
        <ServicePage view={activeConfig} eyebrow={page.eyebrow} description={page.description}>
          <>
            <CommandPanel
              title={page.panelTitle}
              eyebrow={page.panelEyebrow}
              actions={translateActions(commandPage.actions)}
              onRun={runCommand}
            />
            <ShellPanel
              actions={translateShells(commandPage.shells || [])}
              eyebrow={text.shell.panelEyebrow}
              title={text.shell.panelTitle}
              onOpen={runShell}
            />
          </>
        </ServicePage>
      );
    }

    return null;
  }
}
