import { FolderPlus, Save } from "lucide-react";
import { useState } from "react";
import type { AppText, ProjectForm, ProjectRuntimeCatalog, ProjectWebStack } from "@/entities/infrastructure";
import { Button, Modal } from "@/shared/ui";
import { createProjectForm, defaultDocumentRoot, defaultWebPort, validateProjectForm } from "../model/projectForm";
import { ProjectModalFields } from "./ProjectModalFields";

type ProjectModalProps = {
  catalog: ProjectRuntimeCatalog;
  copy: AppText["projects"];
  initialValue?: ProjectForm;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (form: ProjectForm) => void;
};

export function ProjectModal({ catalog, copy, initialValue, mode, onClose, onSubmit }: ProjectModalProps) {
  const [form, setForm] = useState<ProjectForm>(initialValue || createProjectForm(catalog));
  const [error, setError] = useState("");
  const title = mode === "create" ? copy.modal.create : copy.modal.edit;

  const updateField = <Key extends keyof ProjectForm>(key: Key, value: ProjectForm[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateStack = (stack: ProjectWebStack) => {
    setForm((current) => ({
      ...current,
      documentRoot: defaultDocumentRoot(stack),
      enableNode: stack === "node" ? true : current.enableNode,
      webPort: defaultWebPort(stack),
      webStack: stack,
    }));
  };

  const submit = () => {
    const nextError = validateProjectForm(form, copy.validation);
    setError(nextError);
    if (nextError) return;
    onSubmit(form);
    onClose();
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div className="grid gap-4">
        <ProjectModalFields
          catalog={catalog}
          copy={copy}
          error={error}
          form={form}
          mode={mode}
          onFieldChange={updateField}
          onStackChange={updateStack}
        />

        <Button
          className="w-full"
          icon={mode === "create" ? <FolderPlus size={17} strokeWidth={2.4} /> : <Save size={17} strokeWidth={2.4} />}
          tone="primary"
          type="button"
          onClick={submit}
        >
          {mode === "create" ? copy.actions.create : copy.actions.edit}
        </Button>
      </div>
    </Modal>
  );
}
