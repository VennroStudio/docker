import { commandPageRegistry, type CommandAction, registryActions, registryUiActions } from "@/entities/infrastructure";
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
  const registryLink = serviceLink("Registry", registry?.url);
  const registryUiLink = serviceLink("Registry UI", registryUi?.url);
  const registryCredentialsReady = Boolean(
    settings?.registry?.registryUser?.trim() && settings.registry.registryPassword?.trim(),
  );
  const registryRunning = Boolean(registry?.running);

  return {
    description: page.description,
    eyebrow: page.eyebrow,
    modules: [
      {
        actions: disableActionSuffixes(
          translateActions(registryActions),
          !registryCredentialsReady,
          ["up", "start"],
          text.panels.serviceControl.registryCredentialsRequired,
        ),
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
        stateEyebrow: true,
        status: registry,
        statusLabel: text.mariadbInstances.statusLabel,
        title: "Registry",
      },
      {
        actions: disableActionSuffixes(
          translateActions(registryUiActions),
          !registryRunning,
          ["up", "start"],
          text.panels.serviceControl.registryRequired,
        ),
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
        stateEyebrow: true,
        status: registryUi,
        statusLabel: text.mariadbInstances.statusLabel,
        title: "Registry UI",
      },
    ],
  };
}

function disableActionSuffixes(
  actions: CommandAction[],
  disabled: boolean,
  suffixes: string[],
  disabledTitle: string,
) {
  if (!disabled) return actions;

  return actions.map((action) => {
    const suffix = action.id.split(":").at(-1) || "";
    if (!suffixes.includes(suffix)) return action;

    return {
      ...action,
      disabled: true,
      disabledTitle,
    };
  });
}
