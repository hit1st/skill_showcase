import { checkHealth } from "@showcase/observability";
import { jsonWithTrace, withApiObservability } from "@/lib/api";
import type { NextRequest } from "next/server";

const handler = (request: NextRequest) =>
  jsonWithTrace(request, checkHealth(), { status: 200 });

export const GET = withApiObservability("/api/health", handler);
