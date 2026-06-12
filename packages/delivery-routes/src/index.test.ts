import { describe, expect, it } from "vitest";
import {
  CACHE_POLICIES,
  DELIVERY_ROUTES,
  isDeliveryRouteRegistered,
  planFailoverRequests,
} from "./index";

describe("delivery routes", () => {
  it("registers all origin routes", () => {
    expect(isDeliveryRouteRegistered(Object.values(DELIVERY_ROUTES))).toBe(true);
  });

  it("plans fallback when primary returns 503", () => {
    const steps = planFailoverRequests(503);
    expect(steps.at(-1)?.route).toBe(DELIVERY_ROUTES.originFallback);
  });

  it("defines distinct cache policies", () => {
    expect(CACHE_POLICIES.cached).toContain("max-age");
    expect(CACHE_POLICIES.dynamic).toBe("no-store");
  });
});
