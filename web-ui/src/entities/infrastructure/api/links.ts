export type ServiceLink = {
  domain?: string;
  label: string;
  port?: number;
  source: "domain" | "local" | "settings";
  url: string;
};

export type ServiceLinksResponse = {
  links: Record<string, ServiceLink>;
};

export async function fetchServiceLinks(signal?: AbortSignal) {
  const response = await fetch("/api/links", { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as ServiceLinksResponse;
}
