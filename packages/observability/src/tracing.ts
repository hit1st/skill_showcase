export type TraceContext = {
  readonly traceId: string;
  readonly spanId: string;
  readonly requestId: string;
};

const randomHex = (bytes: number): string =>
  [...crypto.getRandomValues(new Uint8Array(bytes))]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");

export const createTraceContext = (): TraceContext => ({
  traceId: randomHex(16),
  spanId: randomHex(8),
  requestId: randomHex(8),
});

export const toTraceparent = (context: TraceContext): string =>
  `00-${context.traceId}-${context.spanId}-01`;

export const parseTraceparent = (
  header: string | null | undefined,
): TraceContext | null => {
  if (!header) {
    return null;
  }

  const match = /^00-([a-f0-9]{32})-([a-f0-9]{16})-[a-f0-9]{2}$/i.exec(header.trim());

  if (!match) {
    return null;
  }

  return {
    traceId: match[1]!.toLowerCase(),
    spanId: match[2]!.toLowerCase(),
    requestId: randomHex(8),
  };
};

export const resolveTraceContext = (
  traceparent: string | null | undefined,
): TraceContext => parseTraceparent(traceparent) ?? createTraceContext();
