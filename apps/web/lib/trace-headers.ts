export type TraceHeaders = {
  readonly traceId: string | null;
  readonly requestId: string | null;
};

export const extractTraceHeaders = (headers: Headers): TraceHeaders => ({
  traceId: headers.get("x-trace-id"),
  requestId: headers.get("x-request-id"),
});

export const jaegerTraceUrl = (
  traceId: string,
  baseUrl = "http://localhost:16686",
): string => `${baseUrl}/trace/${traceId}`;
