import {
  createStreamEventSequence,
  createStreamFailureStore,
  createTimedSseStream,
  formatSseEvents,
  STREAM_EVENT_COUNT,
} from "@showcase/delivery-routes";
import { recordApiRequest } from "@/lib/observability";
import { flushTracing, withRequestTracing, withSseStreamSpan } from "@/lib/request-tracing";
import type { NextRequest } from "next/server";

const streamFailure = createStreamFailureStore();
const streamFrames = formatSseEvents(createStreamEventSequence(STREAM_EVENT_COUNT));

export const GET = async (request: NextRequest): Promise<Response> => {
  const startedAt = Date.now();
  const failOnce = request.nextUrl.searchParams.get("failOnce") === "1";

  return withRequestTracing(request, "/api/stream", async () => {
    const { fail } = streamFailure.evaluate(failOnce);

    if (fail) {
      return withSseStreamSpan({ failOnce, status: 503 }, async () => {
        recordApiRequest({
          route: "/api/stream",
          method: "GET",
          status: 503,
          durationMs: Date.now() - startedAt,
          traceId: request.headers.get("x-trace-id") ?? "unknown",
          requestId: request.headers.get("x-request-id") ?? "unknown",
        });

        await flushTracing();

        return new Response(null, {
          status: 503,
          headers: {
            "x-trace-id": request.headers.get("x-trace-id") ?? "",
          },
        });
      });
    }

    return withSseStreamSpan({ failOnce, status: 200 }, async () => {
      recordApiRequest({
        route: "/api/stream",
        method: "GET",
        status: 200,
        durationMs: Date.now() - startedAt,
        traceId: request.headers.get("x-trace-id") ?? "unknown",
        requestId: request.headers.get("x-request-id") ?? "unknown",
      });

      await flushTracing();

      return new Response(createTimedSseStream(streamFrames, 750), {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "x-trace-id": request.headers.get("x-trace-id") ?? "",
        },
      });
    });
  });
};
