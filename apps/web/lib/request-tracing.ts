import { context } from "@opentelemetry/api";
import {
  apiHandlerAttributes,
  edgeRequestAttributes,
  ensureTracingRegistered,
  originAssetAttributes,
  originRouteAttributes,
  sseStreamAttributes,
} from "@showcase/observability";
import type { NextRequest } from "next/server";

export const traceCarrierFromRequest = (
  request: NextRequest,
): Readonly<Record<string, string>> => ({
  traceparent: request.headers.get("traceparent") ?? "",
  tracestate: request.headers.get("tracestate") ?? "",
});

/**
 * HTTP route I/O boundary: composes nested OTel spans around handler execution.
 * Attribute builders stay pure; span lifecycle remains in tracing-runtime.
 */
export const withRequestTracing = async <T>(
  request: NextRequest,
  route: string,
  fn: () => T | Promise<T>,
): Promise<T> => {
  const runtime = ensureTracingRegistered();
  const parentContext = runtime.extractContext(traceCarrierFromRequest(request));
  const requestId = request.headers.get("x-request-id") ?? "unknown";

  return runtime.withSpan(
    "edge.request",
    edgeRequestAttributes(request.method, route),
    parentContext,
    async () =>
      runtime.withSpan(
        "api.handler",
        apiHandlerAttributes(route, requestId),
        context.active(),
        fn,
      ),
  );
};

export const withOriginAssetSpan = async <T>(
  attributes: { readonly cacheControl: string; readonly cacheStatus: string },
  fn: () => T | Promise<T>,
): Promise<T> =>
  ensureTracingRegistered().withSpan(
    "origin.asset",
    originAssetAttributes(attributes),
    context.active(),
    fn,
  );

export const withOriginRouteSpan = async <T>(
  route: "origin.primary" | "origin.fallback",
  status: number,
  failoverTriggered: boolean,
  fn: () => T | Promise<T>,
): Promise<T> =>
  ensureTracingRegistered().withSpan(
    route,
    originRouteAttributes(route, status, failoverTriggered),
    context.active(),
    fn,
  );

export const withSseStreamSpan = async <T>(
  attributes: { readonly failOnce: boolean; readonly status: number },
  fn: () => T | Promise<T>,
): Promise<T> =>
  ensureTracingRegistered().withSpan(
    "sse.stream",
    sseStreamAttributes(attributes),
    context.active(),
    fn,
  );

export const flushTracing = (): Promise<void> => ensureTracingRegistered().forceFlush();
