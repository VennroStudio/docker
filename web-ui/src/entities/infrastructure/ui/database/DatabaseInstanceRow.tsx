import { DatabaseAction, ShellIconButton, StatusDot } from "../DatabaseControls";
import { databaseActionOrder } from "./types";
import type { DatabaseInstanceRuntime, DatabaseInstancesCopy, DatabaseRuntimeAction } from "./types";

type DatabaseInstanceRowProps<Instance extends DatabaseInstanceRuntime> = {
  actionLabels: Record<DatabaseRuntimeAction | "shell", string>;
  copy: DatabaseInstancesCopy;
  instance: Instance;
  onRun: (instance: Instance, action: DatabaseRuntimeAction) => void;
  onShellOpen: (instance: Instance) => void;
};

export function DatabaseInstanceRow<Instance extends DatabaseInstanceRuntime>({
  actionLabels,
  copy,
  instance,
  onRun,
  onShellOpen,
}: DatabaseInstanceRowProps<Instance>) {
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
        {databaseActionOrder.map((action) => (
          <DatabaseAction
            key={action}
            action={action}
            label={actionLabels[action]}
            onClick={() => onRun(instance, action)}
          />
        ))}
        <ShellIconButton label={actionLabels.shell} onClick={() => onShellOpen(instance)} />
      </div>
    </article>
  );
}
