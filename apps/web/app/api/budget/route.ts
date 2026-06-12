import lighthouseSummary from "@/data/lighthouse-summary.json";
import {
  evaluateBudget,
  parseLighthouseSummary,
} from "@showcase/delivery-routes";
import { jsonWithTrace, withApiObservability } from "@/lib/api";
import type { NextRequest } from "next/server";

const handler = (request: NextRequest) => {
  const snapshot = parseLighthouseSummary(lighthouseSummary);
  const evaluation = evaluateBudget(snapshot);

  return jsonWithTrace(request, {
    snapshot,
    evaluation,
    bundleAnalysisPath: "/docs/architecture#bundle-budget",
    source: "lighthouse-ci-artifact",
  });
};

export const GET = withApiObservability("/api/budget", handler);
