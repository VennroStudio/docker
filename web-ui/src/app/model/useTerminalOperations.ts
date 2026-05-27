import { useRef, useState } from "react";
import type { AppText } from "@/entities/infrastructure";
import { useCommandStream } from "@/features/command-terminal";
import type { useToast } from "@/shared/lib/hooks";

type OperationState = {
  key: string;
  label: string;
};

type ToastApi = Pick<ReturnType<typeof useToast>, "show">;
type CommandStream = ReturnType<typeof useCommandStream>;

export type RunWithTerminalConfig = {
  key: string;
  label: string;
  onSettled?: () => void;
  open: Parameters<CommandStream["run"]>[1];
  preview: string;
};

type UseTerminalOperationsConfig = {
  containerStatesRefresh: () => Promise<void> | void;
  serviceLinksRefresh: () => Promise<void> | void;
  serviceStatusesRefresh: () => void;
  text: AppText;
  toast: ToastApi;
};

export function useTerminalOperations({
  containerStatesRefresh,
  serviceLinksRefresh,
  serviceStatusesRefresh,
  text,
  toast,
}: UseTerminalOperationsConfig) {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [activeOperation, setActiveOperation] = useState<OperationState | null>(null);
  const activeOperationRef = useRef<OperationState | null>(null);
  const commandStream = useCommandStream();
  const operationRunning = commandStream.streamState === "running" && Boolean(activeOperation);
  const activeOperationKey = operationRunning ? activeOperation?.key : null;
  const operationBlockTitle =
    operationRunning && activeOperation ? text.operationToast.blocked(activeOperation.label) : undefined;

  const toggleTerminal = () => setTerminalOpen((value) => !value);

  const runWithTerminal = ({ key, label, onSettled, open, preview }: RunWithTerminalConfig) => {
    const lockedOperation = activeOperationRef.current;
    if (lockedOperation) {
      toast.show({ title: text.operationToast.blocked(lockedOperation.label), tone: "info" });
      return;
    }

    const nextOperation = { key, label };
    activeOperationRef.current = nextOperation;
    setActiveOperation(nextOperation);
    setTerminalOpen(true);

    try {
      commandStream.run(preview, open, {
        onSettled: ({ ok }) => {
          serviceStatusesRefresh();
          void containerStatesRefresh();
          void serviceLinksRefresh();
          toast.show({
            title: ok ? text.operationToast.success(label) : text.operationToast.error(label),
            tone: ok ? "success" : "danger",
          });
          activeOperationRef.current = null;
          setActiveOperation(null);
          onSettled?.();
        },
      });
    } catch (error) {
      activeOperationRef.current = null;
      setActiveOperation(null);
      toast.show({
        message: error instanceof Error ? error.message : String(error),
        title: text.operationToast.error(label),
        tone: "danger",
      });
    }
  };

  const stopCommand = () => {
    const stoppedOperation = activeOperationRef.current ?? activeOperation;

    commandStream.stop();
    activeOperationRef.current = null;
    setActiveOperation(null);
    if (stoppedOperation) toast.show({ title: text.operationToast.stopped(stoppedOperation.label), tone: "info" });
  };

  return {
    activeOperationKey,
    commandStream,
    operationBlockTitle,
    operationRunning,
    runWithTerminal,
    stopCommand,
    terminalOpen,
    toggleTerminal,
  };
}
