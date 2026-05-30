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

export const registryPortFields = [
  {
    group: "registry",
    label: "Registry port",
    name: "registryPort",
    placeholder: "5051",
    type: "number",
  },
] satisfies ServiceModuleConfigSection["fields"];

export const registryAuthFields = [
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

export const registryUiPortFields = [
  {
    group: "registry",
    label: "Registry UI port",
    name: "registryUiPort",
    placeholder: "5081",
    type: "number",
  },
] satisfies ServiceModuleConfigSection["fields"];
