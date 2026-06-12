import { DELIVERY_ROUTES, IMPLEMENTED_ROUTES } from "./constants";

export { CACHE_POLICIES, DELIVERY_ROUTES, IMPLEMENTED_ROUTES } from "./constants";
export type DeliveryRouteKey = keyof typeof DELIVERY_ROUTES;

export const isDeliveryRouteRegistered = (
  registered: readonly string[],
): boolean =>
  IMPLEMENTED_ROUTES.every((route) => registered.includes(route));

export { resolveProbeCacheStatus } from "./cache-headers";
export type { CacheHeaderInput } from "./cache-headers";
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
  resolveStreamResponse,
  STREAM_EVENT_COUNT,
} from "./stream";
export type { StreamEvent, StreamFailureState, StreamFailureStore, StreamResponsePlan } from "./stream";
export { evaluateBudget, parseLighthouseSummary } from "./budget";
export type { BudgetSnapshot, LighthouseSummaryInput } from "./budget";
export {
  evaluateBundleBudget,
  HOME_ROUTE_FIRST_LOAD_JS_BUDGET_KB,
  parseHomeFirstLoadJsKb,
} from "./bundle-budget";
export { toLighthouseSummary } from "./lighthouse-report";
export type { LighthouseReportInput } from "./lighthouse-report";
