export type CacheHeaderInput = Readonly<Record<string, string | null | undefined>>;

export const resolveProbeCacheStatus = (headers: CacheHeaderInput): string =>
  headers["cf-cache-status"] ?? headers["x-showcase-cache-status"] ?? "n/a";
