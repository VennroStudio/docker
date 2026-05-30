import { ContainerStateBadge } from "../ContainerStateBadge";
import { DatabaseAction, ShellIconButton, StatusDot } from "../DatabaseControls";
import { isContainerRunning } from "../../model/containerActions";
import { databaseActionOrder } from "../../model/database/types";
import type { DatabaseInstanceRuntime, DatabaseInstancesCopy, DatabaseRuntimeAction } from "../../model/database/types";

type DatabaseInstanceRowProps<Instance extends DatabaseInstanceRuntime> = {
  activeOperationKey?: null | string;
  actionLabels: Record<DatabaseRuntimeAction | "shell", string>;
  containerRequiredTitle?: string;
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
  containerRequiredTitle,
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
  const running = isContainerRunning(instance.state);
  const actionDisabled = (action: DatabaseRuntimeAction) => operationDisabled || (!running && action !== "up");
  const actionTitle = (label: string, operationKey: string, action: DatabaseRuntimeAction) =>
    operationDisabled && activeOperationKey !== operationKey
      ? operationDisabledTitle
      : !running && action !== "up"
        ? containerRequiredTitle
        : label;
  const shellDisabled = operationDisabled || !running;

  return (
    <article className="flex items-center gap-3 rounded-lg border border-sky-100 bg-white/84 p-3 shadow-[0_10px_24px_rgba(14,165,233,0.12),0_4px_14px_rgba(168,85,247,0.07)]">
      <StatusDot state={instance.state} />
      <div className="min-w-0 flex-1">
        <ContainerStateBadge state={instance.state} />
        <h4 className="truncate text-sm font-bold text-slate-950">{copy.instanceTitle(instance.version)}</h4>
        <p className="truncate text-xs text-slate-500">{instance.container}</p>
        <span className="mt-1 inline-flex rounded-md border border-sky-100 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
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
              disabled={actionDisabled(action)}
              label={actionLabels[action]}
              loading={operationDisabled && activeOperationKey === operationKey}
              title={actionTitle(actionLabels[action], operationKey, action)}
              onClick={() => onRun(instance, action)}
            />
          );
        })}
        <ShellIconButton
          disabled={shellDisabled}
          label={actionLabels.shell}
          loading={operationDisabled && activeOperationKey === shellOperationKey}
          title={
            operationDisabled && activeOperationKey !== shellOperationKey
              ? operationDisabledTitle
              : !running
                ? containerRequiredTitle
                : actionLabels.shell
          }
          onClick={() => onShellOpen(instance)}
        />
      </div>
    </article>
  );
}
