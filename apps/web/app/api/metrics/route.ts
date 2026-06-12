import { getMetricsRegistry } from "@/lib/observability";
import { jsonWithTrace, withApiObservability } from "@/lib/api";
import type { NextRequest } from "next/server";

const handler = (request: NextRequest) =>
  jsonWithTrace(request, getMetricsRegistry().snapshot(), { status: 200 });

export const GET = withApiObservability("/api/metrics", handler);
