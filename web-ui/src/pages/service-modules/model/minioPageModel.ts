import { commandPageRegistry } from "@/entities/infrastructure";
import type { ServiceModulesModelSource } from "./serviceModulesModel";
import { minioConfigFields } from "./serviceModuleFields";
import { serviceLink } from "./serviceModuleHelpers";

export function getMinioPageModel({ minioStatus, text, translateActions, translateShells }: ServiceModulesModelSource) {
  const page = text.servicePages.minio;
  const shell = translateShells(commandPageRegistry.minio.shells || [])[0];
  const link = serviceLink("MinIO", minioStatus?.url);

  return {
    description: page.description,
    eyebrow: page.eyebrow,
    modules: [
      {
        actions: translateActions(commandPageRegistry.minio.actions),
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
        stateEyebrow: true,
        status: minioStatus || undefined,
        statusLabel: text.mariadbInstances.statusLabel,
        title: page.panelTitle,
      },
    ],
  };
}
