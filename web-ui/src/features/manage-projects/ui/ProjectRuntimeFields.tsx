import type { AppText, ProjectForm } from "@/entities/infrastructure";
import { SelectField } from "@/shared/ui";

type ProjectFieldChange = <Key extends keyof ProjectForm>(key: Key, value: ProjectForm[Key]) => void;

export function ProjectPhpFields({
  copy,
  form,
  onFieldChange,
  phpVersions,
}: {
  copy: AppText["projects"];
  form: ProjectForm;
  phpVersions: string[];
  onFieldChange: ProjectFieldChange;
}) {
  return (
    <section className="grid gap-3">
      <span className="text-xs font-semibold uppercase text-teal-700">{copy.sections.runtime}</span>
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField
          label={copy.fields.phpVersion}
          options={phpVersions.map((version) => ({ label: version, value: version }))}
          value={form.phpVersion}
          onChange={(event) => onFieldChange("phpVersion", event.target.value)}
        />
      </div>
    </section>
  );
}

export function ProjectNodeFields({
  copy,
  form,
  nodeManagers,
  nodeVersions,
  onFieldChange,
}: {
  copy: AppText["projects"];
  form: ProjectForm;
  nodeManagers: string[];
  nodeVersions: string[];
  onFieldChange: ProjectFieldChange;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SelectField
        label={copy.fields.nodeVersion}
        options={nodeVersions.map((version) => ({ label: version, value: version }))}
        value={form.nodeVersion}
        onChange={(event) => onFieldChange("nodeVersion", event.target.value)}
      />
      <SelectField
        label={copy.fields.nodePackageManager}
        options={nodeManagers.map((manager) => ({ label: manager, value: manager }))}
        value={form.nodePackageManager}
        onChange={(event) => onFieldChange("nodePackageManager", event.target.value)}
      />
    </div>
  );
}
