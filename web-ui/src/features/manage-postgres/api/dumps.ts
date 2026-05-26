export type PostgresDumpFile = {
  modifiedAt: string;
  name: string;
  path: string;
  size: number;
};

type DumpFilesResponse = {
  dumps: PostgresDumpFile[];
};

export async function fetchPostgresDumps(): Promise<PostgresDumpFile[]> {
  const response = await fetch("/api/dumps?engine=postgres");
  if (!response.ok) throw new Error(await response.text());

  const payload = (await response.json()) as DumpFilesResponse;
  return payload.dumps;
}
