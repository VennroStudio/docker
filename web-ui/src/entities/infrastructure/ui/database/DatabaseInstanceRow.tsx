import { DatabaseAction, ShellIconButton, StatusDot } from "../DatabaseControls";
import { databaseActionOrder } from "./types";
import type { DatabaseInstanceRuntime, DatabaseInstancesCopy, DatabaseRuntimeAction } from "./types";

type DatabaseInstanceRowProps<Instance extends DatabaseInstanceRuntime> = {
  activeOperationKey?: null | string;
  actionLabels: Record<DatabaseRuntimeAction | "shell", string>;
  copy: DatabaseInstancesCopy;
  instance: Instance;
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  operationKeyForAction: (instance: Instance, action: DatabaseRuntimeAction) => string;
  operationKeyForShell: (instance: Instance) => string;
  onRun: (instance: Instance, action: DatabaseRuntimeAction) => void;
  onShellOpen: (instance: Instance) => void;
};

export function DatabaseInstanceRow<Instance extends DatabaseInstanceRuntime>({
  activeOperationKey,
  actionLabels,
  copy,
  instance,
  operationDisabled = false,
  operationDisabledTitle,
  operationKeyForAction,
  operationKeyForShell,
  onRun,
  onShellOpen,
}: DatabaseInstanceRowProps<Instance>) {
  const shellOperationKey = operationKeyForShell(instance);
  const actionTitle = (label: string, operationKey: string) =>
    operationDisabled && activeOperationKey !== operationKey ? operationDisabledTitle : label;

  return (
    <article className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
      <StatusDot state={instance.state} />
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-bold text-zinc-50">{copy.instanceTitle(instance.version)}</h4>
        <p className="truncate text-xs text-zinc-500">{instance.container}</p>
        <span className="mt-1 inline-flex rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[11px] font-semibold text-zinc-400">
          {copy.portLabel}: {instance.hostPort}
        </span>
      </div>
      <div className="flex shrink-0 flex-wrap justify-end gap-2">
        {databaseActionOrder.map((action) => {
          const operationKey = operationKeyForAction(instance, action);

          return (
            <DatabaseAction
              key={action}
              action={action}
              disabled={operationDisabled}
              label={actionLabels[action]}
              loading={operationDisabled && activeOperationKey === operationKey}
              title={actionTitle(actionLabels[action], operationKey)}
              onClick={() => onRun(instance, action)}
            />
          );
        })}
        <ShellIconButton
          disabled={operationDisabled}
          label={actionLabels.shell}
          loading={operationDisabled && activeOperationKey === shellOperationKey}
          title={actionTitle(actionLabels.shell, shellOperationKey)}
          onClick={() => onShellOpen(instance)}
        />
      </div>
    </article>
  );
}
