import { KeyRound, Plus } from "lucide-react";
import { useState } from "react";
import type {
  AppText,
  SshKeyForm,
  SshServer,
  SshServerForm,
  useSshServers,
  ViewConfig,
} from "@/entities/infrastructure";
import { SshKeyModal, SshServerAccordion, SshServerModal } from "@/features/manage-ssh";
import { Button } from "@/shared/ui";
import { ServicePageLayout } from "@/widgets/service-page-layout";

type SshPageProps = {
  sshServers: ReturnType<typeof useSshServers>;
  text: AppText;
  view: ViewConfig;
  onCopyPassword: (password: string) => void;
  onKeyGenerate: (form: SshKeyForm) => void;
  onKeyRemove: (server: SshServer) => void;
  onKeyPush: (server: SshServer) => void;
  onServerAdd: (form: SshServerForm) => void;
  onServerDelete: (server: SshServer) => void;
  onServerSave: (server: SshServer, form: SshServerForm) => void;
  onTerminalOpen: (server: SshServer) => void;
};

export function SshPage({
  onCopyPassword,
  onKeyGenerate,
  onKeyRemove,
  onKeyPush,
  onServerAdd,
  onServerDelete,
  onServerSave,
  onTerminalOpen,
  sshServers,
  text,
  view,
}: SshPageProps) {
  const [serverModalOpen, setServerModalOpen] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const copy = text.ssh;

  return (
    <ServicePageLayout view={view} eyebrow={copy.eyebrow} description={copy.description} title={copy.title}>
      <div className="space-y-4">
        <section className="flex flex-wrap items-center gap-3 rounded-lg border border-sky-100/90 bg-white/70 p-4 shadow-[0_14px_34px_rgba(14,165,233,0.11),0_6px_18px_rgba(168,85,247,0.07)] ring-1 ring-fuchsia-100/40 backdrop-blur">
          <Button icon={<Plus size={18} strokeWidth={2.5} />} tone="primary" onClick={() => setServerModalOpen(true)}>
            {copy.actions.addServer}
          </Button>
          <Button
            disabled={sshServers.servers.length === 0}
            icon={<KeyRound size={18} strokeWidth={2.5} />}
            onClick={() => setKeyModalOpen(true)}
          >
            {copy.actions.generateKey}
          </Button>
        </section>

        {sshServers.error ? <p className="text-sm font-semibold text-red-600">{sshServers.error}</p> : null}
        {sshServers.loading ? <p className="text-sm font-semibold text-slate-500">{text.settings.loading}</p> : null}

        <div className="space-y-4">
          {sshServers.servers.map((server) => (
            <SshServerAccordion
              key={server.id}
              copy={copy}
              server={server}
              onCopyPassword={onCopyPassword}
              onDelete={onServerDelete}
              onKeyRemove={onKeyRemove}
              onKeyPush={onKeyPush}
              onSave={onServerSave}
              onTerminalOpen={onTerminalOpen}
            />
          ))}
        </div>

        {!sshServers.loading && sshServers.servers.length === 0 ? (
          <section className="rounded-lg border border-sky-100 bg-white/70 p-4 text-sm font-semibold text-slate-500 shadow-[0_12px_26px_rgba(14,165,233,0.10)]">
            {copy.empty}
          </section>
        ) : null}
      </div>

      {serverModalOpen ? (
        <SshServerModal copy={copy} onClose={() => setServerModalOpen(false)} onSubmit={onServerAdd} />
      ) : null}
      {keyModalOpen ? (
        <SshKeyModal
          copy={copy}
          servers={sshServers.servers}
          onClose={() => setKeyModalOpen(false)}
          onSubmit={onKeyGenerate}
        />
      ) : null}
    </ServicePageLayout>
  );
}
