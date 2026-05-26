import type { ServiceLink } from "../../api/links";
import type { CommandAction, ContainerRuntimeState, MariaDbInstanceAction, ShellAction } from "../../model/types";

export type DatabaseRuntimeAction = MariaDbInstanceAction;

export type DatabaseInstanceRuntime = {
  container: string;
  hostPort: number;
  name: string;
  state: ContainerRuntimeState;
  version: string;
};

export type DatabaseInstancesCopy = {
  addVersion: string;
  empty: string;
  error: string;
  instanceTitle: (version: string) => string;
  loading: string;
  portLabel: string;
  serversTitle: string;
  title: string;
  titleEyebrow: string;
};

export type DatabaseAdminCopy = {
  containerLabel: string;
  domainLabel: string;
  domainUnknown: string;
  linkLabel: string;
  shellLabel: string;
  statusLabel: string;
};

export type DatabaseAdminOverview = {
  container: string;
  domain?: string;
  state: ContainerRuntimeState;
  status?: string;
};

export type DatabaseAdminSectionProps = {
  actions: CommandAction[];
  copy: DatabaseAdminCopy;
  eyebrow: string;
  link?: ServiceLink;
  open: boolean;
  overview: DatabaseAdminOverview;
  shell?: ShellAction;
  title: string;
  onOpenChange: (open: boolean) => void;
  onRun: (action: CommandAction) => void;
  onShellOpen: (action: ShellAction) => void;
};

export type DatabaseInstancesSectionProps<Instance extends DatabaseInstanceRuntime> = {
  actionLabels: Record<DatabaseRuntimeAction | "shell", string>;
  copy: DatabaseInstancesCopy;
  error: string | null;
  instances: Instance[];
  loading: boolean;
  open: boolean;
  onCreateClick: () => void;
  onOpenChange: (open: boolean) => void;
  onRun: (instance: Instance, action: DatabaseRuntimeAction) => void;
  onShellOpen: (instance: Instance) => void;
};

export const databaseActionOrder: DatabaseRuntimeAction[] = ["up", "down", "start", "stop", "logs", "clean"];

export function commandActionsBySuffix(actions: CommandAction[]) {
  return Object.fromEntries(actions.map((action) => [action.id.split(":")[1], action])) as Partial<
    Record<DatabaseRuntimeAction, CommandAction>
  >;
}
