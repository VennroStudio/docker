import {
  applyContainerActionRules,
  commandPageRegistry,
  redisActions,
  redisinsightActions,
  shellDisabledForContainerState,
} from "@/entities/infrastructure";
import type { ServiceModulesModelSource } from "./serviceModulesModel";
import { redisConfigFields } from "./serviceModuleFields";
import { findShell, serviceLink } from "./serviceModuleHelpers";

export function getRedisPageModel({
  redisStatus,
  settings,
  text,
  translateActions,
  translateShells,
}: ServiceModulesModelSource) {
  const page = text.servicePages.redis;
  const shells = translateShells(commandPageRegistry.redis.shells || []);
  const redisShell = findShell(shells, "redis-container");
  const redisInsightShell = findShell(shells, "redisinsight-container");
  const redis = redisStatus?.redis;
  const redisinsight = redisStatus?.redisinsight;
  const redisInsightLink =
    redisinsight?.state === "running" ? serviceLink("RedisInsight", redisinsight?.url) : undefined;
  const redisPasswordReady = Boolean(settings?.redis?.redisPassword?.trim());
  const redisRunning = redis?.state === "running";

  return {
    description: page.description,
    eyebrow: page.eyebrow,
    modules: [
      {
        actions: applyContainerActionRules(translateActions(redisActions), redis?.state, {
          disabledTitle: text.panels.serviceControl.containerRequired,
          upBlockedTitle: redisPasswordReady ? undefined : text.panels.serviceControl.redisPasswordRequired,
        }),
        configSection: {
          fields: redisConfigFields,
          generateEnvAfterSave: true,
        },
        details: [{ label: text.mariadbInstances.containerLabel, value: redis?.container || redisShell?.container }],
        eyebrow: text.panels.serviceControl.cache,
        shell: redisShell,
        shellDisabled: shellDisabledForContainerState(redis?.state),
        shellDisabledTitle: text.panels.serviceControl.containerRequired,
        stateEyebrow: true,
        status: redis,
        statusLabel: text.mariadbInstances.statusLabel,
        title: "Redis",
      },
      {
        actions: applyContainerActionRules(translateActions(redisinsightActions), redisinsight?.state, {
          disabledTitle: text.panels.serviceControl.containerRequired,
          upBlockedTitle: redisRunning ? undefined : text.panels.serviceControl.redisRequired,
        }),
        details: [
          {
            label: text.mariadbInstances.containerLabel,
            value: redisinsight?.container || redisInsightShell?.container,
          },
          ...(redisInsightLink
            ? [{ href: redisInsightLink.url, label: text.common.link, value: redisInsightLink.url }]
            : []),
        ],
        eyebrow: text.panels.serviceControl.interface,
        link: redisInsightLink,
        shell: redisInsightShell,
        shellDisabled: shellDisabledForContainerState(redisinsight?.state),
        shellDisabledTitle: text.panels.serviceControl.containerRequired,
        stateEyebrow: true,
        status: redisinsight,
        statusLabel: text.mariadbInstances.statusLabel,
        title: "RedisInsight",
      },
    ],
  };
}
