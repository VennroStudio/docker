import {
  applyContainerActionRules,
  commandPageRegistry,
  registryActions,
  registryUiActions,
  shellDisabledForContainerState,
} from "@/entities/infrastructure";
import type { ServiceModulesModelSource } from "./serviceModulesModel";
import { registryAuthFields, registryPortFields, registryUiPortFields } from "./serviceModuleFields";
import { findShell, serviceLink } from "./serviceModuleHelpers";

export function getRegistryPageModel({
  registryStatus,
  settings,
  text,
  translateActions,
  translateShells,
}: ServiceModulesModelSource) {
  const page = text.servicePages.registry;
  const shells = translateShells(commandPageRegistry.registry.shells || []);
  const registryShell = findShell(shells, "registry-container");
  const registryUiShell = findShell(shells, "registry-ui-container");
  const registry = registryStatus?.registry;
  const registryUi = registryStatus?.registryUi;
  const registryLink = registry?.state === "running" ? serviceLink("Registry", registry?.url) : undefined;
  const registryUiLink = registryUi?.state === "running" ? serviceLink("Registry UI", registryUi?.url) : undefined;
  const registryCredentialsReady = Boolean(
    settings?.registry?.registryUser?.trim() && settings.registry.registryPassword?.trim(),
  );
  const registryRunning = Boolean(registry?.running);

  return {
    description: page.description,
    eyebrow: page.eyebrow,
    modules: [
      {
        actions: applyContainerActionRules(translateActions(registryActions), registry?.state, {
          disabledTitle: text.panels.serviceControl.containerRequired,
          upBlockedTitle: registryCredentialsReady ? undefined : text.panels.serviceControl.registryCredentialsRequired,
        }),
        configSections: [
          {
            eyebrow: text.panels.npm.configEyebrow,
            fields: registryPortFields,
            generateEnvAfterSave: true,
            title: text.panels.serviceControl.port,
          },
          {
            eyebrow: text.panels.npm.configEyebrow,
            fields: registryAuthFields,
            generateEnvAfterSave: true,
            title: text.panels.serviceControl.auth,
          },
        ],
        details: [
          { label: text.mariadbInstances.containerLabel, value: registry?.container || registryShell?.container },
          ...(registryLink ? [{ href: registryLink.url, label: text.common.link, value: registryLink.url }] : []),
        ],
        eyebrow: page.panelEyebrow,
        link: registryLink,
        shell: registryShell,
        shellDisabled: shellDisabledForContainerState(registry?.state),
        shellDisabledTitle: text.panels.serviceControl.containerRequired,
        stateEyebrow: true,
        status: registry,
        statusLabel: text.mariadbInstances.statusLabel,
        title: "Registry",
      },
      {
        actions: applyContainerActionRules(translateActions(registryUiActions), registryUi?.state, {
          disabledTitle: text.panels.serviceControl.containerRequired,
          upBlockedTitle: registryRunning ? undefined : text.panels.serviceControl.registryRequired,
        }),
        configSections: [
          {
            eyebrow: text.panels.npm.configEyebrow,
            fields: registryUiPortFields,
            generateEnvAfterSave: true,
            title: text.panels.serviceControl.port,
          },
        ],
        details: [
          { label: text.mariadbInstances.containerLabel, value: registryUi?.container || registryUiShell?.container },
          ...(registryUiLink ? [{ href: registryUiLink.url, label: text.common.link, value: registryUiLink.url }] : []),
        ],
        eyebrow: "Registry UI",
        link: registryUiLink,
        shell: registryUiShell,
        shellDisabled: shellDisabledForContainerState(registryUi?.state),
        shellDisabledTitle: text.panels.serviceControl.containerRequired,
        stateEyebrow: true,
        status: registryUi,
        statusLabel: text.mariadbInstances.statusLabel,
        title: "Registry UI",
      },
    ],
  };
}
