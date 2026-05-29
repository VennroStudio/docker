import { useCallback, useEffect, useState } from "react";
import { fetchSshServers } from "../api/ssh";
import type { SshQuickCommand, SshServer } from "./types";

export function useSshServers(enabled: boolean) {
  const [commands, setCommands] = useState<SshQuickCommand[]>([]);
  const [servers, setServers] = useState<SshServer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetchSshServers();
      setCommands(response.commands || []);
      setServers(response.servers);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
  }, [enabled, refresh]);

  return { commands, error, loading, refresh, servers };
}
