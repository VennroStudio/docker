import type { ServiceModuleConfigSection } from "./types";

export const redisConfigFields = [
  {
    autocomplete: "current-password",
    group: "redis",
    label: "Redis password",
    name: "redisPassword",
    type: "password",
  },
] satisfies ServiceModuleConfigSection["fields"];

export const minioConfigFields = [
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

export const registryConfigFields = [
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
