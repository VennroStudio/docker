import { Database } from "lucide-react";
import { useState } from "react";
import type { AppText, PostgresInstanceForm } from "@/entities/infrastructure";
import { Button, Field, Modal, SelectField } from "@/shared/ui";

type PostgresCreateModalProps = {
  copy: AppText["postgresInstances"];
  onClose: () => void;
  onCreate: (form: PostgresInstanceForm) => void;
};

const initialForm: PostgresInstanceForm = {
  database: "app",
  password: "",
  user: "postgres",
  version: "17",
};

const postgresVersions = ["14", "15", "16", "17", "18"];

export function PostgresCreateModal({ copy, onClose, onCreate }: PostgresCreateModalProps) {
  const [form, setForm] = useState(initialForm);
  const createDisabled = !form.version.trim() || !form.user.trim() || !form.password.trim() || !form.database.trim();

  const updateField = <Key extends keyof PostgresInstanceForm>(key: Key, value: PostgresInstanceForm[Key]) => {
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
          options={postgresVersions.map((version) => ({ label: version, value: version }))}
          value={form.version}
          onChange={(event) => updateField("version", event.target.value)}
        />
        <Field
          label={copy.fields.user}
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
          label={copy.fields.database}
          value={form.database}
          onChange={(event) => updateField("database", event.target.value)}
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
