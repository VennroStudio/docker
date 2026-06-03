import { useMemo } from "react";
import type { AppText, ProjectForm, ProjectRuntimeCatalog, ProjectWebStack } from "@/entities/infrastructure";
import { Field, SelectField, Switch } from "@/shared/ui";
import { ProjectNodeFields, ProjectPhpFields } from "./ProjectRuntimeFields";

type ProjectModalFieldsProps = {
  catalog: ProjectRuntimeCatalog;
  copy: AppText["projects"];
  error: string;
  form: ProjectForm;
  mode: "create" | "edit";
  onFieldChange: <Key extends keyof ProjectForm>(key: Key, value: ProjectForm[Key]) => void;
  onStackChange: (stack: ProjectWebStack) => void;
};

export function ProjectModalFields({
  catalog,
  copy,
  error,
  form,
  mode,
  onFieldChange,
  onStackChange,
}: ProjectModalFieldsProps) {
  const phpPresets = Object.keys(catalog.php?.presets || { laravel: [] });
  const phpVersions = catalog.php?.versions || [form.phpVersion].filter(Boolean);
  const nodeVersions = catalog.node?.versions || [form.nodeVersion].filter(Boolean);
  const nodeManagers = catalog.node?.packageManagers || ["npm"];
  const phpStack = form.webStack === "apache" || form.webStack === "nginx-fpm";
  const nodeControls = form.webStack === "node" || form.enableNode;
  const stackOptions = useMemo(
    () => [
      { label: copy.options.nginxFpm, value: "nginx-fpm" },
      { label: copy.options.apache, value: "apache" },
      { label: copy.options.node, value: "node" },
    ],
    [copy.options.apache, copy.options.nginxFpm, copy.options.node],
  );

  return (
    <>
      <section className="grid gap-3">
        <span className="text-xs font-semibold uppercase text-teal-700">{copy.sections.details}</span>
        <Field
          disabled={mode === "edit"}
          error={error}
          label={copy.fields.name}
          placeholder="project-force"
          value={form.name}
          onChange={(event) => onFieldChange("name", event.target.value)}
        />
      </section>

      <section className="grid gap-3">
        <span className="text-xs font-semibold uppercase text-teal-700">{copy.sections.web}</span>
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            label={copy.fields.webStack}
            options={stackOptions}
            value={form.webStack}
            onChange={(event) => onStackChange(event.target.value as ProjectWebStack)}
          />
          <Field
            label={copy.fields.documentRoot}
            value={form.documentRoot}
            onChange={(event) => onFieldChange("documentRoot", event.target.value)}
          />
          <Field
            label={copy.fields.webPort}
            value={form.webPort}
            onChange={(event) => onFieldChange("webPort", event.target.value)}
          />
          {form.webStack === "node" ? (
            <Field
              label={copy.fields.webCommand}
              value={form.webCommand}
              onChange={(event) => onFieldChange("webCommand", event.target.value)}
            />
          ) : null}
        </div>
      </section>

      {phpStack ? (
        <ProjectPhpFields
          copy={copy}
          form={form}
          phpPresets={phpPresets}
          phpVersions={phpVersions}
          onFieldChange={onFieldChange}
        />
      ) : null}

      <section className="grid gap-3">
        <Switch
          checked={form.enableNode}
          label={copy.fields.enableNode}
          onChange={(checked) => onFieldChange("enableNode", checked)}
        />
        {nodeControls ? (
          <ProjectNodeFields
            copy={copy}
            form={form}
            nodeManagers={nodeManagers}
            nodeVersions={nodeVersions}
            onFieldChange={onFieldChange}
          />
        ) : null}
      </section>
    </>
  );
}
