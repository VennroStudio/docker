import { useCallback, useEffect, useRef, useState } from "react";
import { ToastViewport, type ToastMessage, type ToastTone } from "@/shared/ui";

type ToastInput = {
  message?: string;
  title: string;
  tone?: ToastTone;
};

const createToastId = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    ({ message, title, tone = "info" }: ToastInput) => {
      const id = createToastId();
      setToasts((current) => [...current, { id, message, title, tone }].slice(-4));
      const timer = window.setTimeout(() => dismiss(id), 4200);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    },
    [],
  );

  return {
    show,
    viewport: <ToastViewport toasts={toasts} onDismiss={dismiss} />,
  };
}
