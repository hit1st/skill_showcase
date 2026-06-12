import { jsonWithTrace, withApiObservability } from "@/lib/api";
import type { NextRequest } from "next/server";

const handler = (request: NextRequest) => {
  const simulateFailure = request.nextUrl.searchParams.get("simulateFailure") === "1";

  if (simulateFailure) {
    return jsonWithTrace(
      request,
      { origin: "primary", ok: false, reason: "simulated origin failure" },
      { status: 503 },
    );
  }

  return jsonWithTrace(request, {
    origin: "primary",
    ok: true,
    region: "us-west",
  });
};

export const GET = withApiObservability("/api/origin/primary", handler);
