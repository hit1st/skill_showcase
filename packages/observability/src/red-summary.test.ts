import { describe, expect, it } from "vitest";
import { deriveRedSummary } from "./red-summary";
import type { MetricsSnapshot } from "./metrics";

const snapshot = (
  overrides: Partial<MetricsSnapshot> = {},
): MetricsSnapshot => ({
  http_requests_total: [],
  http_request_errors_total: [],
  http_request_duration_seconds: { count: 0, sum: 0 },
  ...overrides,
});

describe("deriveRedSummary", () => {
  it("returns zeroed summary for an empty snapshot", () => {
    expect(deriveRedSummary(snapshot())).toEqual({
      requestTotal: 0,
      errorTotal: 0,
      errorRate: 0,
      averageLatencyMs: 0,
    });
  });

  it("aggregates rate, errors, and duration from RED counters", () => {
    const summary = deriveRedSummary(
      snapshot({
        http_requests_total: [
          { route: "/api/health", method: "GET", status: 200, value: 3 },
          { route: "/api/health", method: "GET", status: 500, value: 1 },
        ],
        http_request_errors_total: [{ route: "/api/health", value: 1 }],
        http_request_duration_seconds: { count: 4, sum: 0.08 },
      }),
    );

    expect(summary).toEqual({
      requestTotal: 4,
      errorTotal: 1,
      errorRate: 0.25,
      averageLatencyMs: 20,
    });
  });
});
