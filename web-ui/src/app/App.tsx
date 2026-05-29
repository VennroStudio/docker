import { AppShell } from "@/widgets/app-shell";
import { useInfrastructureController } from "@/widgets/infrastructure-controller";
import { Workspace } from "@/widgets/workspace";
import { AppRouter } from "./router/AppRouter";

export function App() {
  const controller = useInfrastructureController();
  const { activeConfig, activeView, appMeta, commandStream, confirmDialog, language, terminalOpen, text } = controller;

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
          output={commandStream.output}
          pageTitle={text.views[activeView]}
          streamState={commandStream.streamState}
          terminalActionLabels={{
            clear: text.common.clear,
            hide: text.common.hide,
            inputPlaceholder: text.shell.inputPlaceholder,
            stop: text.common.stop,
          }}
          terminalCwd={appMeta.projectRoot}
          terminalInputEnabled={commandStream.inputEnabled}
          terminalLabel={text.common.terminal}
          terminalOpen={terminalOpen}
          terminalPrompt={commandStream.prompt}
          terminalStateLabels={text.common.streamLabels}
          terminalTitle={appMeta.projectName}
          view={activeConfig}
          onClear={commandStream.clear}
          onInput={commandStream.sendInput}
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
