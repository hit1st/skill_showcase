import { jsonWithTrace, withApiObservability } from "@/lib/api";
import { withOriginRouteSpan } from "@/lib/request-tracing";
import type { NextRequest } from "next/server";

const handler = async (request: NextRequest) =>
  withOriginRouteSpan("origin.fallback", 200, true, () =>
    jsonWithTrace(request, {
      origin: "fallback",
      ok: true,
      region: "us-east",
      failover: true,
    }),
  );

export const GET = withApiObservability("/api/origin/fallback", handler);
