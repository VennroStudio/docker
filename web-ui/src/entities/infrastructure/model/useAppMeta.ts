import { useEffect, useState } from "react";
import { type AppMeta, fetchAppMeta } from "../api/meta";

const fallbackMeta: AppMeta = {
  projectName: "infrastructure",
  projectRoot: "~/infrastructure",
};

export function useAppMeta() {
  const [meta, setMeta] = useState<AppMeta>(fallbackMeta);

  useEffect(() => {
    const controller = new AbortController();

    fetchAppMeta(controller.signal)
      .then(setMeta)
      .catch(() => setMeta(fallbackMeta));

    return () => controller.abort();
  }, []);

  return meta;
}
