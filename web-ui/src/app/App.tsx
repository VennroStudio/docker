import { AppShell } from "@/widgets/app-shell";
import { useInfrastructureController } from "@/widgets/infrastructure-controller";
import { Workspace } from "@/widgets/workspace";
import { AppRouter } from "./router/AppRouter";

export function App() {
  const controller = useInfrastructureController();
  const {
    activeConfig,
    activeView,
    appMeta,
    confirmDialog,
    language,
    sshTerminalSession,
    terminalOpen,
    terminalSession,
    text,
  } = controller;

  return (
    <>
      <AppShell
        activeView={activeView}
        language={language}
        text={text}
        onSelectView={controller.selectView}
        onToggleLanguage={controller.toggleLanguage}
      >
        <Workspace
          output={terminalSession.output}
          pageTitle={text.views[activeView]}
          terminalState={terminalSession.terminalState}
          terminalActionLabels={{
            clear: text.common.clear,
            hide: text.common.hide,
            inputPlaceholder: text.shell.inputPlaceholder,
            stop: text.common.stop,
          }}
          terminalCwd={appMeta.projectRoot}
          terminalInputEnabled={terminalSession.inputEnabled}
          terminalLabel={text.common.terminal}
          terminalOpen={terminalOpen}
          terminalPrompt={terminalSession.prompt}
          sshTerminal={
            sshTerminalSession
              ? {
                  action: sshTerminalSession.action,
                  cwd: `${sshTerminalSession.server.user}@${sshTerminalSession.server.host}:${sshTerminalSession.server.port}`,
                  input: sshTerminalSession.input,
                  serverId: sshTerminalSession.server.id,
                  title: sshTerminalSession.server.name,
                }
              : null
          }
          terminalStateLabels={text.common.terminalStateLabels}
          terminalTitle={appMeta.projectName}
          view={activeConfig}
          onClear={terminalSession.clear}
          onInput={terminalSession.sendInput}
          onResize={terminalSession.resize}
          onStop={controller.stopCommand}
          onToggleTerminal={controller.toggleTerminal}
        >
          <AppRouter controller={controller} />
        </Workspace>
      </AppShell>
      {confirmDialog.dialog}
      {controller.toast.viewport}
    </>
  );
}
