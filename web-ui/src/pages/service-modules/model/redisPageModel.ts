import { commandPageRegistry, redisActions, redisinsightActions } from "@/entities/infrastructure";
import type { ServiceModulesModelSource } from "./serviceModulesModel";
import { redisConfigFields } from "./serviceModuleFields";
import { findShell, serviceLink } from "./serviceModuleHelpers";

export function getRedisPageModel({ redisStatus, text, translateActions, translateShells }: ServiceModulesModelSource) {
  const page = text.servicePages.redis;
  const shells = translateShells(commandPageRegistry.redis.shells || []);
  const redisShell = findShell(shells, "redis-container");
  const redisInsightShell = findShell(shells, "redisinsight-container");
  const redis = redisStatus?.redis;
  const redisinsight = redisStatus?.redisinsight;
  const redisInsightLink = serviceLink("RedisInsight", redisinsight?.url);

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
        details: [{ label: text.mariadbInstances.containerLabel, value: redis?.container || redisShell?.container }],
        eyebrow: text.panels.serviceControl.cache,
        shell: redisShell,
        stateEyebrow: true,
        status: redis,
        statusLabel: text.mariadbInstances.statusLabel,
        title: "Redis",
      },
      {
        actions: translateActions(redisinsightActions),
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
        stateEyebrow: true,
        status: redisinsight,
        statusLabel: text.mariadbInstances.statusLabel,
        title: "RedisInsight",
      },
    ],
  };
}
