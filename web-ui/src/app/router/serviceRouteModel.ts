import {
  commandPageRegistry,
  redisActions,
  redisinsightActions,
  registryActions,
  registryUiActions,
  type CommandPageId,
  type ShellAction,
} from "@/entities/infrastructure";
import type { InfrastructureController } from "../model/useInfrastructureController";
import type { ServiceModuleDescriptor } from "./ServiceModulesPage";

type ServiceRouteModel = {
  description: string;
  eyebrow: string;
  modules: ServiceModuleDescriptor[];
};

export function getServiceRouteModel(controller: InfrastructureController): ServiceRouteModel | null {
  const { activeView, containerStates, moduleDetails, serviceLinks, text, translateActions, translateShells } =
    controller;
  const statusLabel = text.mariadbInstances.statusLabel;
  const containerLabel = text.mariadbInstances.containerLabel;

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
          status: containerStates.states["redis-container"],
          statusLabel,
          title: "Redis",
        },
        {
          actions: translateActions(redisinsightActions),
          details: moduleDetails(redisInsightShell?.container),
          eyebrow: text.panels.serviceControl.interface,
          link: serviceLinks.links["redisinsight-container"],
          shell: redisInsightShell,
          status: containerStates.states["redisinsight-container"],
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
          status: containerStates.states["registry-container"],
          statusLabel,
          title: "Registry",
        },
        {
          actions: translateActions(registryUiActions),
          details: moduleDetails(registryUiShell?.container),
          eyebrow: "Registry UI",
          link: serviceLinks.links["registry-ui-container"],
          shell: registryUiShell,
          status: containerStates.states["registry-ui-container"],
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
        link: shell ? serviceLinks.links[shell.container] : undefined,
        shell,
        status: shell ? containerStates.states[shell.container] : undefined,
        statusLabel,
        title: page.panelTitle,
      },
    ],
  };
}

function findShell(shells: ShellAction[], container: string) {
  return shells.find((shell) => shell.container === container);
}
