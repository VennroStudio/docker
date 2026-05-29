import { useState } from "react";
import type { AppText, SshServerForm } from "@/entities/infrastructure";
import { Modal } from "@/shared/ui";
import { validateSshServerForm } from "../model/validation";
import { SshServerFormFields } from "./SshServerFormFields";

type SshServerModalProps = {
  copy: AppText["ssh"];
  onClose: () => void;
  onSubmit: (form: SshServerForm) => void;
};

const initialForm: SshServerForm = {
  authType: "password",
  host: "",
  keyPath: "",
  name: "",
  password: "",
  passwordMode: "manual",
  port: "22",
  user: "",
};

export function SshServerModal({ copy, onClose, onSubmit }: SshServerModalProps) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const submit = () => {
    const nextError = validateSshServerForm(form, copy);
    setError(nextError);
    if (nextError) return;
    onSubmit(form);
    onClose();
  };

  return (
    <Modal title={copy.modals.addServer} onClose={onClose}>
      <SshServerFormFields
        copy={copy}
        error={error}
        submitLabel={copy.actions.addServer}
        value={form}
        onChange={setForm}
        onSubmit={submit}
      />
    </Modal>
  );
}
