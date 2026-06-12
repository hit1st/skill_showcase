import { CACHE_POLICIES } from "./constants";

export type AssetKind = "cached" | "dynamic";

export type AssetPayload = {
  readonly kind: AssetKind;
  readonly segmentId: string;
  readonly bytes: number;
  readonly cacheControl: string;
  readonly cacheStatus: "HIT" | "MISS" | "BYPASS";
};

const segmentIdFor = (kind: AssetKind): string =>
  kind === "cached" ? "seg-cached-001" : "seg-dynamic-live";

export const buildAssetPayload = (kind: AssetKind): AssetPayload => ({
  kind,
  segmentId: segmentIdFor(kind),
  bytes: kind === "cached" ? 524_288 : 1_048_576,
  cacheControl: kind === "cached" ? CACHE_POLICIES.cached : CACHE_POLICIES.dynamic,
  cacheStatus: kind === "cached" ? "MISS" : "BYPASS",
});

export type CacheStatus = AssetPayload["cacheStatus"];

export const resolveCacheStatus = (
  kind: AssetKind,
  requestCount: number,
): CacheStatus => {
  if (kind === "dynamic") {
    return "BYPASS";
  }

  return requestCount > 1 ? "HIT" : "MISS";
};

export const showcaseCacheHeader = (status: CacheStatus): string => status;
