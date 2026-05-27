import { useCallback, useEffect, useState } from "react";
import type { DatabaseDumpFile, FetchDumpFiles } from "./formTypes";
import { toErrorMessage } from "./formUtils";

export function useDumpFiles<File extends DatabaseDumpFile>(fetchDumpFiles: FetchDumpFiles<File>) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextFiles = await fetchDumpFiles();
      setFiles(nextFiles);
      return nextFiles;
    } catch (requestError) {
      setFiles([]);
      setError(toErrorMessage(requestError));
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchDumpFiles]);

  useEffect(() => {
    let mounted = true;

    void Promise.resolve()
      .then(() => {
        if (mounted) {
          setLoading(true);
          setError(null);
        }
        return fetchDumpFiles();
      })
      .then((nextFiles) => {
        if (mounted) setFiles(nextFiles);
      })
      .catch((requestError: unknown) => {
        if (mounted) setError(toErrorMessage(requestError));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [fetchDumpFiles]);

  return { error, files, loading, refresh: load };
}
