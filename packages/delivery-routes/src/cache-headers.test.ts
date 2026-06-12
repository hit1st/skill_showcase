import { describe, expect, it } from "vitest";
import { resolveProbeCacheStatus } from "./cache-headers";

describe("resolveProbeCacheStatus", () => {
  it("prefers cf-cache-status when Cloudflare serves the response", () => {
    expect(
      resolveProbeCacheStatus({
        "cf-cache-status": "HIT",
        "x-showcase-cache-status": "MISS",
      }),
    ).toBe("HIT");
  });

  it("falls back to x-showcase-cache-status for local development", () => {
    expect(
      resolveProbeCacheStatus({
        "cf-cache-status": null,
        "x-showcase-cache-status": "MISS",
      }),
    ).toBe("MISS");
  });

  it("returns n/a when neither cache header is present", () => {
    expect(resolveProbeCacheStatus({})).toBe("n/a");
  });
});
