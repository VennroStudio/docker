import { Plus } from "lucide-react";
import { AccordionPanel, Button } from "@/shared/ui";
import { DatabaseInstanceRow } from "./DatabaseInstanceRow";
import { DatabaseSectionState } from "./DatabaseSectionState";
import type { DatabaseInstanceRuntime, DatabaseInstancesSectionProps } from "./types";

export function DatabaseInstancesSection<Instance extends DatabaseInstanceRuntime>({
  activeOperationKey,
  actionLabels,
  copy,
  error,
  instances,
  loading,
  onCreateClick,
  onOpenChange,
  onRun,
  onShellOpen,
  open,
  operationDisabled,
  operationDisabledTitle,
  operationKeyForAction,
  operationKeyForShell,
}: DatabaseInstancesSectionProps<Instance>) {
  return (
    <AccordionPanel
      eyebrow={copy.titleEyebrow}
      open={open}
      title={copy.title}
      actions={
        <>
          <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs font-bold text-zinc-400">
            {instances.length}
          </span>
          <Button
            className="min-h-9 px-3 py-1.5"
            icon={<Plus size={15} strokeWidth={2.6} />}
            disabled={operationDisabled}
            tone="primary"
            title={operationDisabled ? operationDisabledTitle : undefined}
            type="button"
            onClick={onCreateClick}
          >
            {copy.addVersion}
          </Button>
        </>
      }
      onOpenChange={onOpenChange}
    >
      <h3 className="mb-3 text-sm font-bold text-zinc-200">{copy.serversTitle}</h3>
      <div className="grid gap-3">
        <DatabaseSectionState copy={copy} error={error} hasInstances={instances.length > 0} loading={loading} />

        {instances.map((instance) => (
          <DatabaseInstanceRow
            key={instance.name}
            activeOperationKey={activeOperationKey}
            actionLabels={actionLabels}
            copy={copy}
            instance={instance}
            operationDisabled={operationDisabled}
            operationDisabledTitle={operationDisabledTitle}
            operationKeyForAction={operationKeyForAction}
            operationKeyForShell={operationKeyForShell}
            onRun={onRun}
            onShellOpen={onShellOpen}
          />
        ))}
      </div>
    </AccordionPanel>
  );
}
