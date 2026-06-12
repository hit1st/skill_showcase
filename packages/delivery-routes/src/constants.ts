export const DELIVERY_ROUTES = {
  cachedAsset: "/api/asset/cached",
  dynamicAsset: "/api/asset/dynamic",
  originPrimary: "/api/origin/primary",
  originFallback: "/api/origin/fallback",
  stream: "/api/stream",
  budget: "/api/budget",
} as const;

export const CACHE_POLICIES = {
  cached: "public, max-age=3600, stale-while-revalidate=60",
  dynamic: "no-store",
} as const;

export const IMPLEMENTED_ROUTES = Object.values(DELIVERY_ROUTES);
