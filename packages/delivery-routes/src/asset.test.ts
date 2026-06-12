import { describe, expect, it } from "vitest";
import { buildAssetPayload, resolveCacheStatus } from "./asset";

describe("buildAssetPayload", () => {
  it("returns cached asset metadata with cache-friendly policy", () => {
    const payload = buildAssetPayload("cached");

    expect(payload.cacheControl).toContain("max-age");
    expect(payload.cacheStatus).toBe("MISS");
    expect(payload.kind).toBe("cached");
    expect(payload.segmentId).toMatch(/^seg-/);
  });

  it("returns dynamic asset metadata with no-store policy", () => {
    const payload = buildAssetPayload("dynamic");

    expect(payload.cacheControl).toBe("no-store");
    expect(payload.cacheStatus).toBe("BYPASS");
    expect(payload.kind).toBe("dynamic");
  });
});

describe("resolveCacheStatus", () => {
  it("marks repeat cached requests as HIT", () => {
    expect(resolveCacheStatus("cached", 1)).toBe("MISS");
    expect(resolveCacheStatus("cached", 2)).toBe("HIT");
  });
});
