import { NextRequest, NextResponse } from "next/server";
import { flushTracing, withRequestTracing } from "@/lib/request-tracing";
import { recordApiRequest } from "@/lib/observability";

export type ApiHandler = (
  request: NextRequest,
) => NextResponse | Promise<NextResponse>;

export const withApiObservability =
  (route: string, handler: ApiHandler): ApiHandler =>
  async (request) => {
    const startedAt = Date.now();

    const response = await withRequestTracing(request, route, () => handler(request));
    const durationMs = Date.now() - startedAt;

    recordApiRequest({
      route,
      method: request.method,
      status: response.status,
      durationMs,
      traceId: response.headers.get("x-trace-id") ?? request.headers.get("x-trace-id") ?? "unknown",
      requestId: response.headers.get("x-request-id") ?? request.headers.get("x-request-id") ?? "unknown",
    });

    await flushTracing();

    return response;
  };

export const jsonWithTrace = (
  request: NextRequest,
  body: unknown,
  init?: ResponseInit,
): NextResponse => {
  const headers = new Headers(init?.headers);
  const traceId = request.headers.get("x-trace-id");
  const requestId = request.headers.get("x-request-id");

  if (traceId) {
    headers.set("x-trace-id", traceId);
  }

  if (requestId) {
    headers.set("x-request-id", requestId);
  }

  return NextResponse.json(body, { ...init, headers });
};
