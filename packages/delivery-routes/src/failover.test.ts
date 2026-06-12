import { describe, expect, it } from "vitest";
import { planFailoverRequests } from "./failover";

describe("planFailoverRequests", () => {
  it("returns primary only when primary succeeds", () => {
    expect(planFailoverRequests(200)).toEqual([
      { route: "/api/origin/primary", role: "primary" },
    ]);
  });

  it("includes fallback when primary fails with 503", () => {
    expect(planFailoverRequests(503)).toEqual([
      { route: "/api/origin/primary", role: "primary" },
      { route: "/api/origin/fallback", role: "fallback" },
    ]);
  });
});
