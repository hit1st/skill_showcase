import { evaluateReadiness } from "@/lib/observability";
import { jsonWithTrace, withApiObservability } from "@/lib/api";
import type { NextRequest } from "next/server";

const handler = async (request: NextRequest) => {
  const result = await evaluateReadiness();
  return jsonWithTrace(request, result, { status: result.httpStatus });
};

export const GET = withApiObservability("/api/ready", handler);
