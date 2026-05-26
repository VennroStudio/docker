import { networkActions, nginxActions, proxyShells } from "@/entities/infrastructure";
import { HomePage } from "@/pages/home";
import { ProxyPage } from "@/pages/proxy";
import { SettingsPage } from "@/pages/settings";
import type { InfrastructureController } from "../model/useInfrastructureController";
import { DatabaseRoute } from "./DatabaseRoute";
import { ServiceRoute } from "./ServiceRoute";

type AppRouterProps = {
  controller: InfrastructureController;
};

export function AppRouter({ controller }: AppRouterProps) {
  const {
    activeConfig,
    activeOperationKey,
    activeView,
    containerStates,
    operationBlockTitle,
    operationRunning,
    proxyForm,
    runCommand,
    runHost,
    runProxy,
    runProxyDelete,
    runShell,
    selectView,
    serviceLinks,
    serviceStatuses,
    settings,
    setProxyForm,
    text,
    translateActions,
    translateShells,
  } = controller;

  if (activeView === "home") {
    return <HomePage statuses={serviceStatuses.statuses} text={text} onOpenView={selectView} />;
  }

  if (activeView === "proxy") {
    return (
      <ProxyPage
        networkActions={translateActions(networkActions)}
        nginxActions={translateActions(nginxActions)}
        activeOperationKey={activeOperationKey}
        operationDisabled={operationRunning}
        operationDisabledTitle={operationBlockTitle}
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
    return <DatabaseRoute controller={controller} />;
  }

  if (activeView === "settings") {
    return <SettingsPage settingsState={settings} text={text} view={activeConfig} />;
  }

  return <ServiceRoute controller={controller} />;
}
