import {
  commandPageRegistry,
  redisActions,
  redisinsightActions,
  registryActions,
  registryUiActions,
  type AppText,
  type CommandAction,
  type CommandPageId,
  type ContainerStateInfo,
  type RedisStatusResponse,
  type ServiceLink,
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

type ServiceModulesModelSource = {
  activeView: ViewId;
  containerStates: Record<string, ContainerStateInfo>;
  redisStatus: null | RedisStatusResponse;
  serviceLinks: Record<string, ServiceLink>;
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
  containerStates,
  redisStatus,
  serviceLinks,
  text,
  translateActions,
  translateShells,
}: ServiceModulesModelSource): ServiceModulesPageModel | null {
  const statusLabel = text.mariadbInstances.statusLabel;
  const containerLabel = text.mariadbInstances.containerLabel;
  const moduleDetails = (container: string | undefined) => {
    const details: Array<{ href?: string; label: string; value?: string }> = [
      { label: containerLabel, value: container },
    ];
    const link = container ? serviceLinks[container] : undefined;

    if (link) details.push({ href: link.url, label: text.common.link, value: link.url });
    return details;
  };

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

  if (activeView === "registry") {
    const page = text.servicePages.registry;
    const shells = translateShells(commandPageRegistry.registry.shells || []);
    const registryShell = findShell(shells, "registry-container");
    const registryUiShell = findShell(shells, "registry-ui-container");

    return {
      description: page.description,
      eyebrow: page.eyebrow,
      modules: [
        {
          actions: translateActions(registryActions),
          details: moduleDetails(registryShell?.container),
          eyebrow: page.panelEyebrow,
          shell: registryShell,
          status: containerStates["registry-container"],
          statusLabel,
          title: "Registry",
        },
        {
          actions: translateActions(registryUiActions),
          details: moduleDetails(registryUiShell?.container),
          eyebrow: "Registry UI",
          link: serviceLinks["registry-ui-container"],
          shell: registryUiShell,
          status: containerStates["registry-ui-container"],
          statusLabel,
          title: "Registry UI",
        },
      ],
    };
  }

  const commandPage = commandPageRegistry[activeView as CommandPageId];
  const page = text.servicePages[activeView as CommandPageId];
  if (!commandPage || !page) return null;

  const shell = translateShells(commandPage.shells || [])[0];

  return {
    description: page.description,
    eyebrow: page.eyebrow,
    modules: [
      {
        actions: translateActions(commandPage.actions),
        details: moduleDetails(shell?.container),
        eyebrow: page.panelEyebrow,
        link: shell ? serviceLinks[shell.container] : undefined,
        shell,
        status: shell ? containerStates[shell.container] : undefined,
        statusLabel,
        title: page.panelTitle,
      },
    ],
  };
}

function findShell(shells: ShellAction[], container: string) {
  return shells.find((shell) => shell.container === container);
}
