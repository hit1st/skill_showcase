export type SpanAttributes = Readonly<Record<string, string | number | boolean>>;

export const edgeRequestAttributes = (
  method: string,
  route: string,
): SpanAttributes => ({
  "http.method": method,
  "http.route": route,
});

export const apiHandlerAttributes = (
  route: string,
  requestId: string,
): SpanAttributes => ({
  demonstrator: "api",
  "http.route": route,
  request_id: requestId,
});

export const originAssetAttributes = (input: {
  readonly cacheControl: string;
  readonly cacheStatus: string;
}): SpanAttributes => ({
  "cache.control": input.cacheControl,
  "cache.status": input.cacheStatus,
});

export const originRouteAttributes = (
  route: "origin.primary" | "origin.fallback",
  status: number,
  failoverTriggered: boolean,
): SpanAttributes => ({
  "origin.route": route,
  "http.status_code": status,
  "failover.triggered": failoverTriggered,
});

export const sseStreamAttributes = (input: {
  readonly failOnce: boolean;
  readonly status: number;
}): SpanAttributes => ({
  "sse.fail_once": input.failOnce,
  "http.status_code": input.status,
});
