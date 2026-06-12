import { NextResponse, type NextRequest } from "next/server";
import { resolveTraceContext, toTraceparent } from "@showcase/observability/tracing";

export const middleware = (request: NextRequest) => {
  const context = resolveTraceContext(request.headers.get("traceparent"));
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-trace-id", context.traceId);
  requestHeaders.set("x-request-id", context.requestId);
  requestHeaders.set("traceparent", toTraceparent(context));

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("x-trace-id", context.traceId);
  response.headers.set("x-request-id", context.requestId);
  response.headers.set("traceparent", toTraceparent(context));
  response.headers.set("Access-Control-Expose-Headers", "x-trace-id, x-request-id, traceparent");

  return response;
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
