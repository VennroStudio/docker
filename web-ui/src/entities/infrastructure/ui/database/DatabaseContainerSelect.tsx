import type { ChangeEvent } from "react";
import type { DatabaseInstanceOption, InstanceLabel } from "./formTypes";
import { selectClassName } from "./formUtils";

type DatabaseContainerSelectCopy = {
  container: string;
  containerPlaceholder: string;
  emptyInstances: string;
  validation: {
    container: string;
  };
};

type DatabaseContainerSelectProps<Instance extends DatabaseInstanceOption> = {
  copy: DatabaseContainerSelectCopy;
  disabled?: boolean;
  instanceLabel: InstanceLabel<Instance>;
  instances: Instance[];
  ready: boolean;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};

export function DatabaseContainerSelect<Instance extends DatabaseInstanceOption>({
  copy,
  disabled,
  instanceLabel,
  instances,
  onChange,
  ready,
  value,
}: DatabaseContainerSelectProps<Instance>) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-xs font-semibold uppercase text-zinc-500">{copy.container}</span>
      <select
        className={selectClassName}
        disabled={disabled || instances.length === 0}
        value={value}
        onChange={onChange}
      >
        <option value="">{instances.length > 0 ? copy.containerPlaceholder : copy.emptyInstances}</option>
        {instances.map((instance) => (
          <option key={instance.container} value={instance.container}>
            {instanceLabel(instance)}
          </option>
        ))}
      </select>
      {value && !ready ? <span className="text-xs font-medium text-red-200">{copy.validation.container}</span> : null}
    </label>
  );
}
