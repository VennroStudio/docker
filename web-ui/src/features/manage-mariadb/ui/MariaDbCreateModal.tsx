import { Database } from "lucide-react";
import { useState } from "react";
import type { AppText, MariaDbAuthMode, MariaDbInstanceForm } from "@/entities/infrastructure";
import { Button, Field, Modal, SelectField } from "@/shared/ui";

type MariaDbCreateModalProps = {
  copy: AppText["mariadbInstances"];
  defaults?: Partial<MariaDbInstanceForm>;
  onClose: () => void;
  onCreate: (form: MariaDbInstanceForm) => void;
};

const initialForm: MariaDbInstanceForm = {
  authMode: "config",
  password: "",
  rootPassword: "",
  user: "root",
  version: "11.4",
};

const mariaDbVersions = ["10.6", "10.11", "11.4", "11.8", "12.1"];

export function MariaDbCreateModal({ copy, defaults, onClose, onCreate }: MariaDbCreateModalProps) {
  const [form, setForm] = useState<MariaDbInstanceForm>({ ...initialForm, ...defaults });
  const createDisabled =
    !/^\d+(\.\d+){1,2}$/.test(form.version.trim()) ||
    !form.user.trim() ||
    !form.password.trim() ||
    !form.rootPassword.trim();

  const updateField = <Key extends keyof MariaDbInstanceForm>(key: Key, value: MariaDbInstanceForm[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const createInstance = () => {
    onCreate(form);
    onClose();
  };

  return (
    <Modal title={copy.createTitle} onClose={onClose}>
      <div className="grid gap-3">
        <SelectField
          label={copy.fields.version}
          options={mariaDbVersions.map((version) => ({ label: version, value: version }))}
          value={form.version}
          onChange={(event) => updateField("version", event.target.value)}
        />
        <Field
          label={copy.fields.user}
          placeholder="app"
          value={form.user}
          onChange={(event) => updateField("user", event.target.value)}
        />
        <Field
          label={copy.fields.password}
          type="password"
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
        />
        <Field
          label={copy.fields.rootPassword}
          type="password"
          value={form.rootPassword}
          onChange={(event) => updateField("rootPassword", event.target.value)}
        />
        <SelectField
          label={copy.fields.authMode}
          options={[
            { label: copy.authModes.config, value: "config" },
            { label: copy.authModes.cookie, value: "cookie" },
          ]}
          value={form.authMode}
          onChange={(event) => updateField("authMode", event.target.value as MariaDbAuthMode)}
        />
        <Button
          className="mt-2 w-full"
          disabled={createDisabled}
          icon={<Database size={17} strokeWidth={2.4} />}
          tone="primary"
          type="button"
          onClick={createInstance}
        >
          {copy.create}
        </Button>
      </div>
    </Modal>
  );
}
