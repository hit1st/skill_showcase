import {
  createStreamEventSequence,
  createStreamFailureStore,
  createTimedSseStream,
  formatSseEvents,
  resolveStreamResponse,
  STREAM_EVENT_COUNT,
} from "@showcase/delivery-routes";
import { recordApiRequest } from "@/lib/observability";
import { flushTracing, withRequestTracing, withSseStreamSpan } from "@/lib/request-tracing";
import type { NextRequest } from "next/server";

const streamFailure = createStreamFailureStore();
const streamFrames = formatSseEvents(createStreamEventSequence(STREAM_EVENT_COUNT));

const traceHeader = (request: NextRequest): string =>
  request.headers.get("x-trace-id") ?? "";

export const GET = async (request: NextRequest): Promise<Response> => {
  const startedAt = Date.now();
  const failOnce = request.nextUrl.searchParams.get("failOnce") === "1";

  return withRequestTracing(request, "/api/stream", async () => {
    const plan = resolveStreamResponse({
      failOnce,
      fail: streamFailure.evaluate(failOnce).fail,
    });

    return withSseStreamSpan(
      { failOnce: plan.failOnce, status: plan.sseSpanStatus },
      async () => {
        recordApiRequest({
          route: "/api/stream",
          method: "GET",
          status: plan.status,
          durationMs: Date.now() - startedAt,
          traceId: request.headers.get("x-trace-id") ?? "unknown",
          requestId: request.headers.get("x-request-id") ?? "unknown",
        });

        await flushTracing();

        if (plan.mode === "failure") {
          return new Response(null, {
            status: 503,
            headers: {
              "x-trace-id": traceHeader(request),
            },
          });
        }

        return new Response(createTimedSseStream(streamFrames, 750), {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "x-trace-id": traceHeader(request),
          },
        });
      },
    );
  });
};
