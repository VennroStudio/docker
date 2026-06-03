import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchProjectsOverview } from "../api/projects";
import type { Project, ProjectRuntimeCatalog } from "./types";

export function useProjects(enabled: boolean) {
  const [catalog, setCatalog] = useState<ProjectRuntimeCatalog>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const overview = await fetchProjectsOverview(signal);
      setCatalog(overview.catalog);
      setProjects(overview.projects);
    } catch (caught) {
      if (!signal?.aborted) {
        setCatalog({});
        setProjects([]);
        setError(caught instanceof Error ? caught.message : String(caught));
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void refresh(controller.signal);
    }, 0);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [enabled, refresh]);

  return useMemo(() => ({ catalog, error, loading, projects, refresh }), [catalog, error, loading, projects, refresh]);
}
