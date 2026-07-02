import type {
  AppText,
  CommandAction,
  RustfsStatusResponse,
  RedisStatusResponse,
  RegistryStatusResponse,
  ShellAction,
  ViewId,
} from "@/entities/infrastructure";
import type { AppSettings } from "@/entities/settings";
import { getRustfsPageModel } from "./rustfsPageModel";
import { getRedisPageModel } from "./redisPageModel";
import { getRegistryPageModel } from "./registryPageModel";
import type { ServiceModuleDescriptor } from "./types";

export type ServiceModulesModelSource = {
  activeView: ViewId;
  rustfsStatus: null | RustfsStatusResponse;
  redisStatus: null | RedisStatusResponse;
  registryStatus: null | RegistryStatusResponse;
  settings: AppSettings | null;
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
  if (source.activeView === "rustfs") return getRustfsPageModel(source);
  if (source.activeView === "registry") return getRegistryPageModel(source);

  return null;
}
