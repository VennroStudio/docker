import { commandPageRegistry, registryActions, registryUiActions } from "@/entities/infrastructure";
import type { ServiceModulesModelSource } from "./serviceModulesModel";
import { registryConfigFields } from "./serviceModuleFields";
import { findShell, serviceLink } from "./serviceModuleHelpers";

export function getRegistryPageModel({
  registryStatus,
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

  return {
    description: page.description,
    eyebrow: page.eyebrow,
    modules: [
      {
        actions: translateActions(registryActions),
        configSection: {
          fields: registryConfigFields,
          generateEnvAfterSave: true,
        },
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
        actions: translateActions(registryUiActions),
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
