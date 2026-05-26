export type MariaDbDumpFile = {
  modifiedAt: string;
  name: string;
  path: string;
  size: number;
};

type DumpFilesResponse = {
  dumps: MariaDbDumpFile[];
};

export async function fetchMariaDbDumps(): Promise<MariaDbDumpFile[]> {
  const response = await fetch("/api/dumps");
  if (!response.ok) throw new Error(await response.text());

  const payload = (await response.json()) as DumpFilesResponse;
  return payload.dumps;
}
