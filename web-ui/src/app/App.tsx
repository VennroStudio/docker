import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useServiceLinks } from "../features/links/model/useServiceLinks";
import { MariaDbInstancesPanel } from "../features/mariadb/MariaDbInstancesPanel";
import { useMariaDbInstances } from "../features/mariadb/model/useMariaDbInstances";
import { ModuleAccordion } from "../features/modules/ModuleAccordion";
import { useContainerStates } from "../features/status/model/useContainerStates";
import { useServiceStatuses } from "../features/status/model/useServiceStatuses";
import { useCommandStream } from "../features/terminal/model/useCommandStream";
import { HomePage } from "../pages/home/HomePage";
import { NpmPage } from "../pages/npm/NpmPage";
import { commandPageRegistry, proxyShells, type CommandPageId } from "../pages/service/model/pageRegistry";
import { ServicePage } from "../pages/service/ServicePage";
import {
  streamCommand,
  streamHost,
  streamMariaDbInstanceAction,
  streamMariaDbInstanceCreate,
  streamProxy,
  streamProxyDelete,
  streamShell,
} from "../shared/api/stream";
import {
  networkActions,
  nginxActions,
  pgadminActions,
  phpmyadminActions,
  postgresActions,
  redisActions,
  redisinsightActions,
  registryActions,
  registryUiActions,
} from "../shared/config/actions";
import { getViewById, getViewByPath } from "../shared/config/views";
import { dictionaries } from "../shared/i18n";
import { useConfirmDialog } from "../shared/model/useConfirmDialog";
import { useAppMeta } from "../shared/model/useAppMeta";
import { useLanguage } from "../shared/model/useLanguage";
import type {
  CommandAction,
  MariaDbInstance,
  MariaDbInstanceAction,
  MariaDbInstanceForm,
  ProxyFormState,
  ShellAction,
  ViewId,
} from "../shared/types/commands";
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
  const activeShells =
    activeView === "proxy" ? proxyShells : commandPageRegistry[activeView as CommandPageId]?.shells || [];
  const containerStates = useContainerStates({
    enabled: activeView !== "home" && activeView !== "mariadb",
    names: activeShells.map((shell) => shell.container),
  });
  const serviceLinks = useServiceLinks();
  const serviceStatuses = useServiceStatuses({ enabled: activeView === "home" });
  const mariaDbInstances = useMariaDbInstances(activeView === "mariadb");
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

  const runWithTerminal = (preview: string, open: Parameters<typeof commandStream.run>[1], onSettled?: () => void) => {
    setTerminalOpen(true);
    commandStream.run(preview, open, {
      onSettled: () => {
        serviceStatuses.refresh();
        void containerStates.refresh();
        void serviceLinks.refresh();
        onSettled?.();
      },
    });
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

  const runMariaDbInstanceCreate = (form: MariaDbInstanceForm) => {
    runWithTerminal(
      `node ./scripts/mariadb-instances.mjs add --version ${form.version}`,
      (handlers) => streamMariaDbInstanceCreate(form, handlers),
      mariaDbInstances.refresh,
    );
  };

  const runMariaDbInstanceAction = async (instance: MariaDbInstance, action: MariaDbInstanceAction) => {
    if (action === "clean" || action === "down" || action === "stop") {
      const confirmed = await confirmDialog.confirm({
        body: text.confirm.runCommand.body(`mariadb instance ${action}: ${instance.name}`),
        confirmLabel: text.confirm.runCommand.confirmLabel,
        title: text.mariadbInstances.actions[action].label,
        tone: "danger",
      });
      if (!confirmed) return;
    }

    runWithTerminal(
      `docker compose -f ${instance.composeFile} ${action}`,
      (handlers) => streamMariaDbInstanceAction(instance.name, action, handlers),
      mariaDbInstances.refresh,
    );
  };

  const runMariaDbInstanceShell = (instance: MariaDbInstance) => {
    runWithTerminal(`docker exec -i ${instance.container} sh`, (handlers) => streamShell(instance.container, handlers));
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
          statusByContainer={containerStates.states}
          serviceLinks={serviceLinks.links}
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
          <MariaDbInstancesPanel
            error={mariaDbInstances.error}
            instances={mariaDbInstances.instances}
            loading={mariaDbInstances.loading}
            phpmyadmin={mariaDbInstances.phpmyadmin}
            phpmyadminActions={translateActions(phpmyadminActions)}
            phpmyadminLink={serviceLinks.links["phpmyadmin-container"]}
            phpmyadminShell={shells.find((shell) => shell.container === "phpmyadmin-container")}
            text={text}
            onCreate={runMariaDbInstanceCreate}
            onPhpMyAdminRun={runCommand}
            onPhpMyAdminShellOpen={runShell}
            onRun={runMariaDbInstanceAction}
            onShellOpen={runMariaDbInstanceShell}
          />
        </ServicePage>
      );
    }

    if (activeView === "postgres") {
      const page = text.servicePages.postgres;
      const shells = translateShells(commandPageRegistry.postgres.shells || []);
      const postgresShell = shells.find((shell) => shell.container === "postgres-container");
      const pgAdminShell = shells.find((shell) => shell.container === "pgadmin-container");

      return (
        <ServicePage view={activeConfig} eyebrow={page.eyebrow} description={page.description}>
          <div className="module-stack">
            <ModuleAccordion
              actions={translateActions(postgresActions)}
              eyebrow={text.panels.serviceControl.database}
              shell={postgresShell}
              status={containerStates.states["postgres-container"]}
              statusLabel={text.mariadbInstances.statusLabel}
              title="Postgres"
              details={[{ label: text.mariadbInstances.containerLabel, value: postgresShell?.container }]}
              onRun={runCommand}
              onShellOpen={runShell}
            />
            <ModuleAccordion
              actions={translateActions(pgadminActions)}
              eyebrow={text.panels.serviceControl.adminPanel}
              link={serviceLinks.links["pgadmin-container"]}
              shell={pgAdminShell}
              status={containerStates.states["pgadmin-container"]}
              statusLabel={text.mariadbInstances.statusLabel}
              title="pgAdmin"
              details={moduleDetails(pgAdminShell?.container)}
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
      const redisShell = shells.find((shell) => shell.container === "redis-container");
      const redisInsightShell = shells.find((shell) => shell.container === "redisinsight-container");

      return (
        <ServicePage view={activeConfig} eyebrow={page.eyebrow} description={page.description}>
          <div className="module-stack">
            <ModuleAccordion
              actions={translateActions(redisActions)}
              eyebrow={text.panels.serviceControl.cache}
              shell={redisShell}
              status={containerStates.states["redis-container"]}
              statusLabel={text.mariadbInstances.statusLabel}
              title="Redis"
              details={[{ label: text.mariadbInstances.containerLabel, value: redisShell?.container }]}
              onRun={runCommand}
              onShellOpen={runShell}
            />
            <ModuleAccordion
              actions={translateActions(redisinsightActions)}
              eyebrow={text.panels.serviceControl.interface}
              link={serviceLinks.links["redisinsight-container"]}
              shell={redisInsightShell}
              status={containerStates.states["redisinsight-container"]}
              statusLabel={text.mariadbInstances.statusLabel}
              title="RedisInsight"
              details={moduleDetails(redisInsightShell?.container)}
              onRun={runCommand}
              onShellOpen={runShell}
            />
          </div>
        </ServicePage>
      );
    }

    if (activeView === "registry") {
      const page = text.servicePages.registry;
      const shells = translateShells(commandPageRegistry.registry.shells || []);
      const registryShell = shells.find((shell) => shell.container === "registry-container");
      const registryUiShell = shells.find((shell) => shell.container === "registry-ui-container");

      return (
        <ServicePage view={activeConfig} eyebrow={page.eyebrow} description={page.description}>
          <div className="module-stack">
            <ModuleAccordion
              actions={translateActions(registryActions)}
              eyebrow={page.panelEyebrow}
              shell={registryShell}
              status={containerStates.states["registry-container"]}
              statusLabel={text.mariadbInstances.statusLabel}
              title="Registry"
              details={moduleDetails(registryShell?.container)}
              onRun={runCommand}
              onShellOpen={runShell}
            />
            <ModuleAccordion
              actions={translateActions(registryUiActions)}
              eyebrow="Registry UI"
              link={serviceLinks.links["registry-ui-container"]}
              shell={registryUiShell}
              status={containerStates.states["registry-ui-container"]}
              statusLabel={text.mariadbInstances.statusLabel}
              title="Registry UI"
              details={moduleDetails(registryUiShell?.container)}
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
      const shells = translateShells(commandPage.shells || []);
      const shell = shells[0];
      const moduleLink = shell ? serviceLinks.links[shell.container] : undefined;

      return (
        <ServicePage view={activeConfig} eyebrow={page.eyebrow} description={page.description}>
          <div className="module-stack">
            <ModuleAccordion
              title={page.panelTitle}
              eyebrow={page.panelEyebrow}
              actions={translateActions(commandPage.actions)}
              link={moduleLink}
              shell={shell}
              status={shell ? containerStates.states[shell.container] : undefined}
              statusLabel={text.mariadbInstances.statusLabel}
              details={moduleDetails(shell?.container)}
              onRun={runCommand}
              onShellOpen={runShell}
            />
          </div>
        </ServicePage>
      );
    }

    return null;
  }

  function linkDetail(container: string) {
    const link = serviceLinks.links[container];
    return link ? { href: link.url, label: text.common.link, value: link.url } : undefined;
  }

  function moduleDetails(container: string | undefined) {
    const details: Array<{ href?: string; label: string; value?: string }> = [
      { label: text.mariadbInstances.containerLabel, value: container },
    ];
    const link = container ? linkDetail(container) : undefined;

    if (link) details.push(link);
    return details;
  }
}
