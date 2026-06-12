import { DELIVERY_ROUTES, IMPLEMENTED_ROUTES } from "./constants";

export { CACHE_POLICIES, DELIVERY_ROUTES, IMPLEMENTED_ROUTES } from "./constants";
export type DeliveryRouteKey = keyof typeof DELIVERY_ROUTES;

export const isDeliveryRouteRegistered = (
  registered: readonly string[],
): boolean =>
  IMPLEMENTED_ROUTES.every((route) => registered.includes(route));

export { buildAssetPayload, resolveCacheStatus, showcaseCacheHeader } from "./asset";
export type { AssetKind, AssetPayload, CacheStatus } from "./asset";
export {
  advanceCacheSession,
  createCacheSessionStore,
  initialCacheSession,
} from "./cache-session";
export type { CacheSessionState, CacheSessionStore } from "./cache-session";
export { planFailoverRequests } from "./failover";
export type { FailoverStep } from "./failover";
export {
  computeReconnectDelayMs,
  createStreamEvent,
  createStreamEventSequence,
  createStreamFailureStore,
  createTimedSseStream,
  evaluateStreamFailure,
  formatSseEvent,
  formatSseEvents,
  initialStreamFailureState,
  STREAM_EVENT_COUNT,
} from "./stream";
export type { StreamEvent, StreamFailureState, StreamFailureStore } from "./stream";
export { evaluateBudget, parseLighthouseSummary } from "./budget";
export type { BudgetSnapshot, LighthouseSummaryInput } from "./budget";
