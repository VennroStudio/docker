import type {
  AppText,
  CommandAction,
  MinioStatusResponse,
  RedisStatusResponse,
  RegistryStatusResponse,
  ShellAction,
  ViewId,
} from "@/entities/infrastructure";
import { getMinioPageModel } from "./minioPageModel";
import { getRedisPageModel } from "./redisPageModel";
import { getRegistryPageModel } from "./registryPageModel";
import type { ServiceModuleDescriptor } from "./types";

export type ServiceModulesModelSource = {
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

export function getServiceModulesPageModel(source: ServiceModulesModelSource): ServiceModulesPageModel | null {
  if (source.activeView === "redis") return getRedisPageModel(source);
  if (source.activeView === "minio") return getMinioPageModel(source);
  if (source.activeView === "registry") return getRegistryPageModel(source);

  return null;
}
