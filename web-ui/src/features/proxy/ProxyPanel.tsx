import { Globe2, Link2, Trash2, Unlink2 } from "lucide-react";
import type { AppText } from "../../shared/i18n";
import type { ProxyFormState } from "../../shared/types/commands";
import { Button } from "../../shared/ui/Button";
import { Field } from "../../shared/ui/Field";
import { Panel } from "../../shared/ui/Panel";
import { Switch } from "../../shared/ui/Switch";
import { isValidHostForm, isValidProxyForm } from "./model/validation";

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
      <div className="proxy-form">
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
        <div className="field-row">
          <Field
            label="Port"
            value={value.port}
            inputMode="numeric"
            onChange={(event) => update({ port: event.target.value })}
          />
          <Switch label="SSL" checked={value.ssl} onChange={(ssl) => update({ ssl })} />
        </div>
      </div>

      <div className="action-stack">
        <div className="split-actions">
          <Button
            className="large-action"
            tone="primary"
            icon={<Link2 size={17} />}
            disabled={!proxyReady}
            onClick={onCreateProxy}
          >
            {text.panels.proxy.createProxy}
          </Button>
          <Button
            className="large-action"
            tone="danger"
            icon={<Unlink2 size={17} />}
            disabled={!hostReady}
            onClick={onProxyDelete}
          >
            {text.panels.proxy.deleteProxy}
          </Button>
        </div>
        <div className="split-actions">
          <Button className="large-action" icon={<Globe2 size={17} />} disabled={!hostReady} onClick={onHostAdd}>
            {text.panels.proxy.addHost}
          </Button>
          <Button
            className="large-action"
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
