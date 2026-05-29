import { useCallback, useEffect, useState } from "react";
import { fetchSshServers } from "../api/ssh";
import type { SshServer } from "./types";

export function useSshServers(enabled: boolean) {
  const [servers, setServers] = useState<SshServer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetchSshServers();
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

  return { error, loading, refresh, servers };
}
