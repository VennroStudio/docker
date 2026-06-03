import { fetchJson } from "@/shared/api";
import type { Project, ProjectRuntimeCatalog } from "../model/types";

export type ProjectsOverview = {
  catalog: ProjectRuntimeCatalog;
  projects: Project[];
};

export async function fetchProjectsOverview(signal?: AbortSignal) {
  return fetchJson<ProjectsOverview>("/api/projects", { signal }, "Projects request failed");
}
