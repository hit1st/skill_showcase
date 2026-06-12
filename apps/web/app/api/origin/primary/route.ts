import { jsonWithTrace, withApiObservability } from "@/lib/api";
import { withOriginRouteSpan } from "@/lib/request-tracing";
import type { NextRequest } from "next/server";

const handler = async (request: NextRequest) => {
  const simulateFailure = request.nextUrl.searchParams.get("simulateFailure") === "1";

  if (simulateFailure) {
    return withOriginRouteSpan("origin.primary", 503, true, () =>
      jsonWithTrace(
        request,
        { origin: "primary", ok: false, reason: "simulated origin failure" },
        { status: 503 },
      ),
    );
  }

  return withOriginRouteSpan("origin.primary", 200, false, () =>
    jsonWithTrace(request, {
      origin: "primary",
      ok: true,
      region: "us-west",
    }),
  );
};

export const GET = withApiObservability("/api/origin/primary", handler);
