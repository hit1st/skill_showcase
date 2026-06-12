import {
  createStreamEventSequence,
  createStreamFailureStore,
  createTimedSseStream,
  formatSseEvents,
  STREAM_EVENT_COUNT,
} from "@showcase/delivery-routes";
import { recordApiRequest } from "@/lib/observability";
import type { NextRequest } from "next/server";

const streamFailure = createStreamFailureStore();
const streamFrames = formatSseEvents(createStreamEventSequence(STREAM_EVENT_COUNT));

export const GET = async (request: NextRequest): Promise<Response> => {
  const startedAt = Date.now();
  const failOnce = request.nextUrl.searchParams.get("failOnce") === "1";
  const { fail } = streamFailure.evaluate(failOnce);

  if (fail) {
    recordApiRequest({
      route: "/api/stream",
      method: "GET",
      status: 503,
      durationMs: Date.now() - startedAt,
      traceId: request.headers.get("x-trace-id") ?? "unknown",
      requestId: request.headers.get("x-request-id") ?? "unknown",
    });

    return new Response(null, {
      status: 503,
      headers: {
        "x-trace-id": request.headers.get("x-trace-id") ?? "",
      },
    });
  }

  recordApiRequest({
    route: "/api/stream",
    method: "GET",
    status: 200,
    durationMs: Date.now() - startedAt,
    traceId: request.headers.get("x-trace-id") ?? "unknown",
    requestId: request.headers.get("x-request-id") ?? "unknown",
  });

  return new Response(createTimedSseStream(streamFrames, 750), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "x-trace-id": request.headers.get("x-trace-id") ?? "",
    },
  });
};
