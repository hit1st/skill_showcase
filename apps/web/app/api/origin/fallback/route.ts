import { jsonWithTrace, withApiObservability } from "@/lib/api";
import type { NextRequest } from "next/server";

const handler = (request: NextRequest) =>
  jsonWithTrace(request, {
    origin: "fallback",
    ok: true,
    region: "us-east",
    failover: true,
  });

export const GET = withApiObservability("/api/origin/fallback", handler);
