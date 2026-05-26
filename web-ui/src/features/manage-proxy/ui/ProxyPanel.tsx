import type { AppText } from "@/entities/infrastructure";
import type { ProxyFormState } from "@/entities/infrastructure";
import { Panel } from "@/shared/ui";
import { isValidHostForm, isValidProxyForm } from "../model/validation";
import { ProxyActionGrid } from "./ProxyActionGrid";
import { ProxyFormFields } from "./ProxyFormFields";

type ProxyPanelProps = {
  activeOperationKey?: null | string;
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  text: AppText;
  value: ProxyFormState;
  onChange: (value: ProxyFormState) => void;
  onCreateProxy: () => void;
  onHostAdd: () => void;
  onHostRemove: () => void;
  onProxyDelete: () => void;
};

export function ProxyPanel({
  activeOperationKey,
  onChange,
  onCreateProxy,
  onHostAdd,
  onHostRemove,
  onProxyDelete,
  operationDisabled,
  operationDisabledTitle,
  text,
  value,
}: ProxyPanelProps) {
  const update = (patch: Partial<ProxyFormState>) => onChange({ ...value, ...patch });
  const hostReady = isValidHostForm(value);
  const proxyReady = isValidProxyForm(value);
  const copy = text.panels.proxy;

  return (
    <Panel title={copy.title} eyebrow={copy.eyebrow} badge="NPM">
      <ProxyFormFields copy={copy} value={value} onChange={update} />
      <ProxyActionGrid
        activeOperationKey={activeOperationKey}
        copy={copy}
        hostReady={hostReady}
        operationDisabled={operationDisabled}
        operationDisabledTitle={operationDisabledTitle}
        proxyReady={proxyReady}
        onCreateProxy={onCreateProxy}
        onHostAdd={onHostAdd}
        onHostRemove={onHostRemove}
        onProxyDelete={onProxyDelete}
      />
    </Panel>
  );
}
