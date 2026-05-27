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
  type ServiceLink,
  type ShellAction,
  type ViewId,
} from "@/entities/infrastructure";
import type { ServiceModuleDescriptor } from "./types";

type ServiceModulesModelSource = {
  activeView: ViewId;
  containerStates: Record<string, ContainerStateInfo>;
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

    return {
      description: page.description,
      eyebrow: page.eyebrow,
      modules: [
        {
          actions: translateActions(redisActions),
          details: [{ label: containerLabel, value: redisShell?.container }],
          eyebrow: text.panels.serviceControl.cache,
          shell: redisShell,
          status: containerStates["redis-container"],
          statusLabel,
          title: "Redis",
        },
        {
          actions: translateActions(redisinsightActions),
          details: moduleDetails(redisInsightShell?.container),
          eyebrow: text.panels.serviceControl.interface,
          link: serviceLinks["redisinsight-container"],
          shell: redisInsightShell,
          status: containerStates["redisinsight-container"],
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
