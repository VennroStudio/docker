import { Plus } from "lucide-react";
import { AccordionPanel, Button } from "@/shared/ui";
import { DatabaseInstanceRow } from "./DatabaseInstanceRow";
import { DatabaseSectionState } from "./DatabaseSectionState";
import type { DatabaseInstanceRuntime, DatabaseInstancesSectionProps } from "../../model/database/types";

export function DatabaseInstancesSection<Instance extends DatabaseInstanceRuntime>({
  activeOperationKey,
  actionLabels,
  children,
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
          <span className="rounded-md border border-sky-100 bg-sky-50 px-2 py-1 text-xs font-bold text-slate-500 shadow-[0_4px_10px_rgba(14,165,233,0.10)]">
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
      <h3 className="mb-3 text-sm font-bold text-slate-800">{copy.serversTitle}</h3>
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
        {children}
      </div>
    </AccordionPanel>
  );
}
