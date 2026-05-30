import {
  applyContainerActionRules,
  commandPageRegistry,
  shellDisabledForContainerState,
} from "@/entities/infrastructure";
import type { ServiceModulesModelSource } from "./serviceModulesModel";
import { minioConfigFields } from "./serviceModuleFields";
import { serviceLink } from "./serviceModuleHelpers";

export function getMinioPageModel({
  minioStatus,
  settings,
  text,
  translateActions,
  translateShells,
}: ServiceModulesModelSource) {
  const page = text.servicePages.minio;
  const shell = translateShells(commandPageRegistry.minio.shells || [])[0];
  const link = minioStatus?.state === "running" ? serviceLink("MinIO", minioStatus?.url) : undefined;
  const minioCredentialsReady = Boolean(
    settings?.minio?.minioRootUser?.trim() && settings.minio.minioRootPassword?.trim(),
  );

  return {
    description: page.description,
    eyebrow: page.eyebrow,
    modules: [
      {
        actions: applyContainerActionRules(translateActions(commandPageRegistry.minio.actions), minioStatus?.state, {
          disabledTitle: text.panels.serviceControl.containerRequired,
          upBlockedTitle: minioCredentialsReady ? undefined : text.panels.serviceControl.minioCredentialsRequired,
        }),
        configSection: {
          fields: minioConfigFields,
          generateEnvAfterSave: true,
        },
        details: [
          { label: text.mariadbInstances.containerLabel, value: minioStatus?.container || shell?.container },
          ...(link ? [{ href: link.url, label: text.common.link, value: link.url }] : []),
        ],
        eyebrow: page.panelEyebrow,
        link,
        shell,
        shellDisabled: shellDisabledForContainerState(minioStatus?.state),
        shellDisabledTitle: text.panels.serviceControl.containerRequired,
        stateEyebrow: true,
        status: minioStatus || undefined,
        statusLabel: text.mariadbInstances.statusLabel,
        title: page.panelTitle,
      },
    ],
  };
}
