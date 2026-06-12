import { describe, expect, it } from "vitest";
import { createMetricsRegistry, deriveMetricsSnapshot } from "./metrics";

describe("deriveMetricsSnapshot", () => {
  it("reduces request events into RED metrics without mutation", () => {
    const snapshot = deriveMetricsSnapshot([
      { route: "/api/health", method: "GET", status: 200, durationMs: 12 },
      { route: "/api/health", method: "GET", status: 500, durationMs: 40 },
    ]);

    expect(snapshot.http_requests_total).toEqual([
      { route: "/api/health", method: "GET", status: 200, value: 1 },
      { route: "/api/health", method: "GET", status: 500, value: 1 },
    ]);
    expect(snapshot.http_request_errors_total).toEqual([
      { route: "/api/health", value: 1 },
    ]);
    expect(snapshot.http_request_duration_seconds.count).toBe(2);
    expect(snapshot.http_request_duration_seconds.sum).toBeCloseTo(0.052);
  });
});

describe("createMetricsRegistry", () => {
  it("records RED metrics for a request", () => {
    const registry = createMetricsRegistry();

    registry.recordRequest({
      route: "/api/health",
      method: "GET",
      status: 200,
      durationMs: 12,
    });

    registry.recordRequest({
      route: "/api/health",
      method: "GET",
      status: 500,
      durationMs: 40,
    });

    const snapshot = registry.snapshot();

    expect(snapshot.http_requests_total).toEqual([
      { route: "/api/health", method: "GET", status: 200, value: 1 },
      { route: "/api/health", method: "GET", status: 500, value: 1 },
    ]);
    expect(snapshot.http_request_errors_total).toEqual([
      { route: "/api/health", value: 1 },
    ]);
    expect(snapshot.http_request_duration_seconds.count).toBe(2);
    expect(snapshot.http_request_duration_seconds.sum).toBeCloseTo(0.052);
  });
});
