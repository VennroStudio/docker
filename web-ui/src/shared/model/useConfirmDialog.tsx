import { useCallback, useRef, useState } from "react";
import { ConfirmDialog, type ConfirmDialogState } from "../ui/ConfirmDialog";

type Resolver = (confirmed: boolean) => void;

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState | null>(null);
  const resolver = useRef<Resolver | null>(null);

  const confirm = useCallback((nextState: ConfirmDialogState) => {
    setState(nextState);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((confirmed: boolean) => {
    resolver.current?.(confirmed);
    resolver.current = null;
    setState(null);
  }, []);

  const dialog = state ? (
    <ConfirmDialog {...state} onCancel={() => close(false)} onConfirm={() => close(true)} />
  ) : null;

  return { confirm, dialog };
}
