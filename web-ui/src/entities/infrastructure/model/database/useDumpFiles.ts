import { useCallback, useEffect, useState } from "react";
import type { DatabaseDumpFile, FetchDumpFiles } from "./formTypes";
import { toErrorMessage } from "./formUtils";

export function useDumpFiles<File extends DatabaseDumpFile>(fetchDumpFiles: FetchDumpFiles<File>) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (signal?.aborted) return [];

      setLoading(true);
      setError(null);

      try {
        const nextFiles = await fetchDumpFiles();
        if (signal?.aborted) return [];

        setFiles(nextFiles);
        return nextFiles;
      } catch (requestError) {
        if (signal?.aborted) return [];

        setFiles([]);
        setError(toErrorMessage(requestError));
        return [];
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [fetchDumpFiles],
  );

  const refresh = useCallback(() => load(), [load]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => load(controller.signal));

    return () => {
      controller.abort();
    };
  }, [load]);

  return { error, files, loading, refresh };
}
