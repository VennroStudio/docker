import { useCallback, useEffect, useState } from "react";
import { fetchAnsible, updateAnsibleConfig, updateAnsiblePlaybook } from "../api/ansible";
import type { AnsibleState } from "./types";

export function useAnsible(enabled: boolean) {
  const [state, setState] = useState<AnsibleState | null>(null);
  const [playbookText, setPlaybookText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const applyState = useCallback((nextState: AnsibleState) => {
    setState(nextState);
    setPlaybookText(nextState.playbook);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      applyState(await fetchAnsible());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setLoading(false);
    }
  }, [applyState]);

  const saveConfig = useCallback(
    async (config: Record<string, boolean | null | number | string>) => {
      setSaving(true);
      setError("");

      try {
        applyState(await updateAnsibleConfig(config));
        return true;
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : String(requestError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [applyState],
  );

  const savePlaybook = useCallback(
    async (playbook: string) => {
      setSaving(true);
      setError("");

      try {
        applyState(await updateAnsiblePlaybook(playbook));
        return true;
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : String(requestError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [applyState],
  );

  useEffect(() => {
    if (!enabled) return;

    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [enabled, refresh]);

  return {
    error,
    loading,
    playbookText,
    refresh,
    saveConfig,
    savePlaybook,
    saving,
    setPlaybookText,
    state,
  };
}
