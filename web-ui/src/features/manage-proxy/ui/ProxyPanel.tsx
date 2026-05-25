import { Globe2, Link2, Trash2, Unlink2 } from "lucide-react";
import type { AppText } from "@/entities/infrastructure";
import type { ProxyFormState } from "@/entities/infrastructure";
import { Button } from "@/shared/ui";
import { Field } from "@/shared/ui";
import { Panel } from "@/shared/ui";
import { Switch } from "@/shared/ui";
import { isValidHostForm, isValidProxyForm } from "../model/validation";

type ProxyPanelProps = {
  text: AppText;
  value: ProxyFormState;
  onChange: (value: ProxyFormState) => void;
  onCreateProxy: () => void;
  onHostAdd: () => void;
  onHostRemove: () => void;
  onProxyDelete: () => void;
};

export function ProxyPanel({
  onChange,
  onCreateProxy,
  onHostAdd,
  onHostRemove,
  onProxyDelete,
  text,
  value,
}: ProxyPanelProps) {
  const update = (patch: Partial<ProxyFormState>) => onChange({ ...value, ...patch });
  const hostReady = isValidHostForm(value);
  const proxyReady = isValidProxyForm(value);

  return (
    <Panel title={text.panels.proxy.title} eyebrow={text.panels.proxy.eyebrow} badge="NPM">
      <div className="grid gap-3">
        <Field
          label={text.panels.proxy.domain}
          value={value.domain}
          onChange={(event) => update({ domain: event.target.value })}
        />
        <Field
          label={text.panels.proxy.target}
          value={value.target}
          onChange={(event) => update({ target: event.target.value })}
        />
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Field
            label="Port"
            value={value.port}
            inputMode="numeric"
            onChange={(event) => update({ port: event.target.value })}
          />
          <Switch label="SSL" checked={value.ssl} onChange={(ssl) => update({ ssl })} />
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            className="w-full"
            tone="primary"
            icon={<Link2 size={17} />}
            disabled={!proxyReady}
            onClick={onCreateProxy}
          >
            {text.panels.proxy.createProxy}
          </Button>
          <Button
            className="w-full"
            tone="danger"
            icon={<Unlink2 size={17} />}
            disabled={!hostReady}
            onClick={onProxyDelete}
          >
            {text.panels.proxy.deleteProxy}
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button className="w-full" icon={<Globe2 size={17} />} disabled={!hostReady} onClick={onHostAdd}>
            {text.panels.proxy.addHost}
          </Button>
          <Button
            className="w-full"
            tone="danger"
            icon={<Trash2 size={17} />}
            disabled={!hostReady}
            onClick={onHostRemove}
          >
            {text.panels.proxy.removeHost}
          </Button>
        </div>
      </div>
    </Panel>
  );
}
