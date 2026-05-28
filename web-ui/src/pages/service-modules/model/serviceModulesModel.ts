import {
  commandPageRegistry,
  redisActions,
  redisinsightActions,
  registryActions,
  registryUiActions,
  type AppText,
  type CommandAction,
  type MinioStatusResponse,
  type RedisStatusResponse,
  type RegistryStatusResponse,
  type ShellAction,
  type ViewId,
} from "@/entities/infrastructure";
import type { ServiceModuleDescriptor } from "./types";
import type { ServiceModuleConfigSection } from "./types";

const redisConfigFields = [
  {
    autocomplete: "current-password",
    group: "redis",
    label: "Redis password",
    name: "redisPassword",
    type: "password",
  },
] satisfies ServiceModuleConfigSection["fields"];

const minioConfigFields = [
  {
    autocomplete: "username",
    group: "minio",
    label: "MinIO root user",
    name: "minioRootUser",
  },
  {
    autocomplete: "current-password",
    group: "minio",
    label: "MinIO root password",
    name: "minioRootPassword",
    type: "password",
  },
] satisfies ServiceModuleConfigSection["fields"];

const registryConfigFields = [
  {
    autocomplete: "username",
    group: "registry",
    label: "Registry user",
    name: "registryUser",
  },
  {
    autocomplete: "current-password",
    group: "registry",
    label: "Registry password",
    name: "registryPassword",
    type: "password",
  },
] satisfies ServiceModuleConfigSection["fields"];

type ServiceModulesModelSource = {
  activeView: ViewId;
  minioStatus: null | MinioStatusResponse;
  redisStatus: null | RedisStatusResponse;
  registryStatus: null | RegistryStatusResponse;
  text: AppText;
  translateActions: (actions: CommandAction[]) => CommandAction[];
  translateShells: (actions: ShellAction[]) => ShellAction[];
};

type ServiceModulesPageModel = {
  description: string;
  eyebrow: string;
  modules: ServiceModuleDescriptor[];
};

export function getServiceModulesPageModel({
  activeView,
  minioStatus,
  redisStatus,
  registryStatus,
  text,
  translateActions,
  translateShells,
}: ServiceModulesModelSource): ServiceModulesPageModel | null {
  const statusLabel = text.mariadbInstances.statusLabel;
  const containerLabel = text.mariadbInstances.containerLabel;

  if (activeView === "redis") {
    const page = text.servicePages.redis;
    const shells = translateShells(commandPageRegistry.redis.shells || []);
    const redisShell = findShell(shells, "redis-container");
    const redisInsightShell = findShell(shells, "redisinsight-container");
    const redis = redisStatus?.redis;
    const redisinsight = redisStatus?.redisinsight;
    const redisInsightLink = redisinsight?.url
      ? { label: "RedisInsight", source: "settings" as const, url: redisinsight.url }
      : undefined;

    return {
      description: page.description,
      eyebrow: page.eyebrow,
      modules: [
        {
          actions: translateActions(redisActions),
          configSection: {
            fields: redisConfigFields,
            generateEnvAfterSave: true,
          },
          details: [{ label: containerLabel, value: redis?.container || redisShell?.container }],
          eyebrow: text.panels.serviceControl.cache,
          shell: redisShell,
          stateEyebrow: true,
          status: redis,
          statusLabel,
          title: "Redis",
        },
        {
          actions: translateActions(redisinsightActions),
          details: [
            { label: containerLabel, value: redisinsight?.container || redisInsightShell?.container },
            ...(redisInsightLink
              ? [{ href: redisInsightLink.url, label: text.common.link, value: redisInsightLink.url }]
              : []),
          ],
          eyebrow: text.panels.serviceControl.interface,
          link: redisInsightLink,
          shell: redisInsightShell,
          stateEyebrow: true,
          status: redisinsight,
          statusLabel,
          title: "RedisInsight",
        },
      ],
    };
  }

  if (activeView === "minio") {
    const page = text.servicePages.minio;
    const shell = translateShells(commandPageRegistry.minio.shells || [])[0];
    const link = minioStatus?.url ? { label: "MinIO", source: "settings" as const, url: minioStatus.url } : undefined;

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
            { label: containerLabel, value: minioStatus?.container || shell?.container },
            ...(link ? [{ href: link.url, label: text.common.link, value: link.url }] : []),
          ],
          eyebrow: page.panelEyebrow,
          link,
          shell,
          stateEyebrow: true,
          status: minioStatus || undefined,
          statusLabel,
          title: page.panelTitle,
        },
      ],
    };
  }

  if (activeView === "registry") {
    const page = text.servicePages.registry;
    const shells = translateShells(commandPageRegistry.registry.shells || []);
    const registryShell = findShell(shells, "registry-container");
    const registryUiShell = findShell(shells, "registry-ui-container");
    const registry = registryStatus?.registry;
    const registryUi = registryStatus?.registryUi;
    const registryLink = registry?.url ? { label: "Registry", source: "settings" as const, url: registry.url } : undefined;
    const registryUiLink = registryUi?.url ? { label: "Registry UI", source: "settings" as const, url: registryUi.url } : undefined;

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
            { label: containerLabel, value: registry?.container || registryShell?.container },
            ...(registryLink ? [{ href: registryLink.url, label: text.common.link, value: registryLink.url }] : []),
          ],
          eyebrow: page.panelEyebrow,
          link: registryLink,
          shell: registryShell,
          stateEyebrow: true,
          status: registry,
          statusLabel,
          title: "Registry",
        },
        {
          actions: translateActions(registryUiActions),
          details: [
            { label: containerLabel, value: registryUi?.container || registryUiShell?.container },
            ...(registryUiLink ? [{ href: registryUiLink.url, label: text.common.link, value: registryUiLink.url }] : []),
          ],
          eyebrow: "Registry UI",
          link: registryUiLink,
          shell: registryUiShell,
          stateEyebrow: true,
          status: registryUi,
          statusLabel,
          title: "Registry UI",
        },
      ],
    };
  }

  return null;
}

function findShell(shells: ShellAction[], container: string) {
  return shells.find((shell) => shell.container === container);
}
