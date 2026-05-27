type DatabasesResponse = {
  databases: string[];
};

export async function fetchMariaDbDatabases(container: string): Promise<string[]> {
  const response = await fetch(`/api/databases?engine=mariadb&container=${encodeURIComponent(container)}`);
  if (!response.ok) throw new Error(await response.text());

  const payload = (await response.json()) as DatabasesResponse;
  return payload.databases;
}
