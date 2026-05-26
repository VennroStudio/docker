import { RotateCcw, Save } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import type { AppText } from "@/entities/infrastructure";
import type { AppSettings, SettingsResponse } from "@/entities/settings";
import { cn } from "@/shared/lib";
import { Button, Field } from "@/shared/ui";

type SettingsFormProps = {
  copy: AppText["settings"];
  exists: boolean;
  loading?: boolean;
  path: string;
  saving?: boolean;
  settings: AppSettings;
  onSave: (settings: AppSettings) => Promise<SettingsResponse>;
};

type SettingsGroup = keyof AppSettings;
type SettingsFieldDefinition = {
  autocomplete?: string;
  env: string;
  group: SettingsGroup;
  label: string;
  name: string;
  placeholder?: string;
  type?: "password" | "text";
};

type SettingsSectionDefinition = {
  id: keyof AppText["settings"]["sections"];
  fields: SettingsFieldDefinition[];
};

const sections: SettingsSectionDefinition[] = [
  {
    id: "environment",
    fields: [
      { env: "ENV", group: "environment", label: "Environment", name: "env", placeholder: "local" },
      {
        env: "NODE_LIBRARY",
        group: "environment",
        label: "Node image",
        name: "nodeLibrary",
        placeholder: "24-bookworm",
      },
    ],
  },
  {
    id: "proxy",
    fields: [
      {
        env: "NPM_URL",
        group: "proxy",
        label: "NPM URL",
        name: "npmUrl",
        placeholder: "http://host.docker.internal:81",
      },
      { autocomplete: "username", env: "NPM_EMAIL", group: "proxy", label: "NPM email", name: "npmEmail" },
      {
        autocomplete: "current-password",
        env: "NPM_PASSWORD",
        group: "proxy",
        label: "NPM password",
        name: "npmPassword",
        type: "password",
      },
    ],
  },
  {
    id: "mariadb",
    fields: [
      {
        env: "MARIADB_VERSION",
        group: "mariadb",
        label: "MariaDB version",
        name: "defaultVersion",
        placeholder: "10.6",
      },
      {
        autocomplete: "current-password",
        env: "MYSQL_ROOT_PASSWORD",
        group: "mariadb",
        label: "Root password",
        name: "rootPassword",
        type: "password",
      },
      { env: "DB_NAME", group: "mariadb", label: "Default database", name: "defaultDatabase", placeholder: "wp" },
      { env: "DUMP_NAME", group: "mariadb", label: "Dump file name", name: "dumpName", placeholder: "app.sql.gz" },
      {
        env: "HOME_DUMP_PATH",
        group: "mariadb",
        label: "Local dump path",
        name: "homeDumpPath",
        placeholder: "dumps/mariadb/",
      },
      {
        env: "SERVER_DUMP_PATH",
        group: "mariadb",
        label: "Server dump path",
        name: "serverDumpPath",
        placeholder: "/home/user/infrastructure/",
      },
    ],
  },
  {
    id: "deployment",
    fields: [
      { env: "SSH", group: "deployment", label: "SSH shortcut", name: "ssh", placeholder: "user@host" },
      { env: "SERVER_HOST", group: "deployment", label: "Server host", name: "host", placeholder: "84.22.144.239" },
      { env: "SERVER_PORT", group: "deployment", label: "Server port", name: "port", placeholder: "22" },
      { env: "SERVER_USER", group: "deployment", label: "Server user", name: "user", placeholder: "vennro" },
      {
        env: "SERVER_SSH_KEY",
        group: "deployment",
        label: "SSH key",
        name: "sshKey",
        placeholder: "/root/.ssh/id_rsa",
      },
    ],
  },
  {
    id: "registry",
    fields: [
      {
        autocomplete: "username",
        env: "REGISTRY_USER",
        group: "registry",
        label: "Registry user",
        name: "registryUser",
      },
      {
        autocomplete: "current-password",
        env: "REGISTRY_PASSWORD",
        group: "registry",
        label: "Registry password",
        name: "registryPassword",
        type: "password",
      },
      {
        autocomplete: "username",
        env: "DOCKERHUB_USERNAME",
        group: "registry",
        label: "Docker Hub user",
        name: "dockerhubUsername",
      },
      {
        autocomplete: "current-password",
        env: "DOCKERHUB_PASSWORD",
        group: "registry",
        label: "Docker Hub password",
        name: "dockerhubPassword",
        type: "password",
      },
    ],
  },
  {
    id: "storage",
    fields: [
      {
        autocomplete: "username",
        env: "MINIO_ROOT_USER",
        group: "storage",
        label: "MinIO root user",
        name: "minioRootUser",
      },
      {
        autocomplete: "current-password",
        env: "MINIO_ROOT_PASSWORD",
        group: "storage",
        label: "MinIO root password",
        name: "minioRootPassword",
        type: "password",
      },
      {
        autocomplete: "current-password",
        env: "REDIS_PASSWORD",
        group: "storage",
        label: "Redis password",
        name: "redisPassword",
        type: "password",
      },
    ],
  },
  {
    id: "postgres",
    fields: [
      { autocomplete: "username", env: "POSTGRES_USER", group: "postgres", label: "Postgres user", name: "user" },
      {
        autocomplete: "current-password",
        env: "POSTGRES_PASSWORD",
        group: "postgres",
        label: "Postgres password",
        name: "password",
        type: "password",
      },
      { env: "POSTGRES_DB", group: "postgres", label: "Postgres database", name: "database", placeholder: "mydb" },
      {
        env: "POSTGRES_DUMP_NAME",
        group: "postgres",
        label: "Postgres dump name",
        name: "dumpName",
        placeholder: "app.dump",
      },
      {
        env: "POSTGRES_HOME_DUMP_PATH",
        group: "postgres",
        label: "Postgres local dump path",
        name: "homeDumpPath",
        placeholder: "dumps/postgres/",
      },
      {
        env: "POSTGRES_SERVER_DUMP_PATH",
        group: "postgres",
        label: "Postgres server dump path",
        name: "serverDumpPath",
        placeholder: "/home/user/infrastructure/",
      },
      {
        autocomplete: "username",
        env: "PGADMIN_EMAIL",
        group: "postgres",
        label: "pgAdmin email",
        name: "pgAdminEmail",
      },
      {
        autocomplete: "current-password",
        env: "PGADMIN_PASSWORD",
        group: "postgres",
        label: "pgAdmin password",
        name: "pgAdminPassword",
        type: "password",
      },
    ],
  },
];

export function SettingsForm({
  copy,
  exists,
  loading = false,
  onSave,
  path,
  saving = false,
  settings,
}: SettingsFormProps) {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [savedSettings, setSavedSettings] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(savedSettings), [draft, savedSettings]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft || saving) return;

    void onSave(draft)
      .then((response) => {
        setDraft(response.settings);
        setSavedSettings(response.settings);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2200);
      })
      .catch(() => undefined);
  };

  const updateField = (group: SettingsGroup, name: string, value: string) => {
    setSaved(false);
    setDraft((current) => {
      return {
        ...current,
        [group]: {
          ...current[group],
          [name]: value,
        },
      };
    });
  };

  const readField = (group: SettingsGroup, name: string) => (draft[group] as Record<string, string>)[name] ?? "";

  if (loading) {
    return (
      <section className="rounded-lg border border-zinc-800/90 bg-zinc-950/58 p-4">
        <p className="text-sm font-semibold text-zinc-400">{copy.loading}</p>
      </section>
    );
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <section className="rounded-lg border border-zinc-800/90 bg-zinc-950/58 p-4 shadow-sm shadow-black/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-zinc-500">{copy.sourceLabel}</p>
            <p className="mt-1 truncate text-sm font-semibold text-zinc-200">{path}</p>
          </div>
          <span
            className={cn(
              "rounded-md border px-2 py-1 text-xs font-bold",
              exists
                ? "border-emerald-300/35 bg-emerald-400/12 text-emerald-100"
                : "border-amber-300/35 bg-amber-400/12 text-amber-100",
            )}
          >
            {exists ? copy.sourceReady : copy.sourceMissing}
          </span>
        </div>
      </section>

      <div className="grid gap-4 min-[1280px]:grid-cols-2">
        {sections.map((section) => (
          <section
            key={section.id}
            className="rounded-lg border border-zinc-800/90 bg-zinc-950/58 p-4 shadow-sm shadow-black/20"
          >
            <header className="mb-4">
              <p className="text-xs font-semibold uppercase text-teal-300/80">{copy.sectionEyebrow}</p>
              <h2 className="mt-1 text-lg font-bold text-zinc-50">{copy.sections[section.id]}</h2>
            </header>
            <div className="grid gap-3">
              {section.fields.map((field) => (
                <Field
                  key={`${field.group}.${field.name}`}
                  autoComplete={field.autocomplete}
                  label={`${field.label} / ${field.env}`}
                  placeholder={field.placeholder}
                  type={field.type || "text"}
                  value={readField(field.group, field.name)}
                  onChange={(event) => updateField(field.group, field.name, event.target.value)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="sticky bottom-4 z-10 rounded-lg border border-zinc-800/90 bg-zinc-950/90 p-3 shadow-xl shadow-black/30 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={cn("text-sm font-medium", saved ? "text-emerald-200" : "text-zinc-500")}>
            {saved ? copy.saved : dirty ? copy.unsaved : copy.clean}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!dirty || saving}
              icon={<RotateCcw size={17} strokeWidth={2.4} />}
              type="button"
              onClick={() => setDraft(savedSettings)}
            >
              {copy.reset}
            </Button>
            <Button
              disabled={!dirty || saving}
              icon={<Save size={17} strokeWidth={2.4} />}
              loading={saving}
              tone="primary"
              type="submit"
            >
              {copy.save}
            </Button>
          </div>
        </div>
      </section>
    </form>
  );
}
