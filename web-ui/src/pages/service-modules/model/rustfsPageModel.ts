import {
  applyContainerActionRules,
  commandPageRegistry,
  shellDisabledForContainerState,
} from "@/entities/infrastructure";
import type { ServiceModulesModelSource } from "./serviceModulesModel";
import { rustfsConfigFields } from "./serviceModuleFields";
import { serviceLink } from "./serviceModuleHelpers";

export function getRustfsPageModel({
  rustfsStatus,
  settings,
  text,
  translateActions,
  translateShells,
}: ServiceModulesModelSource) {
  const page = text.servicePages.rustfs;
  const shell = translateShells(commandPageRegistry.rustfs.shells || [])[0];
  const link = rustfsStatus?.state === "running" ? serviceLink("RustFS", rustfsStatus?.url) : undefined;
  const rustfsCredentialsReady = Boolean(
    settings?.rustfs?.rustfsAccessKey?.trim() && settings.rustfs.rustfsSecretKey?.trim(),
  );

  return {
    description: page.description,
    eyebrow: page.eyebrow,
    modules: [
      {
        actions: applyContainerActionRules(translateActions(commandPageRegistry.rustfs.actions), rustfsStatus?.state, {
          disabledTitle: text.panels.serviceControl.containerRequired,
          upBlockedTitle: rustfsCredentialsReady ? undefined : text.panels.serviceControl.rustfsCredentialsRequired,
        }),
        configSection: {
          fields: rustfsConfigFields,
          generateEnvAfterSave: true,
        },
        details: [
          { label: text.mariadbInstances.containerLabel, value: rustfsStatus?.container || shell?.container },
          ...(link ? [{ href: link.url, label: text.common.link, value: link.url }] : []),
        ],
        eyebrow: page.panelEyebrow,
        link,
        shell,
        shellDisabled: shellDisabledForContainerState(rustfsStatus?.state),
        shellDisabledTitle: text.panels.serviceControl.containerRequired,
        stateEyebrow: true,
        status: rustfsStatus || undefined,
        statusLabel: text.mariadbInstances.statusLabel,
        title: page.panelTitle,
      },
    ],
  };
}
