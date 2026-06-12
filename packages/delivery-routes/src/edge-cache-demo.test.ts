import { describe, expect, it } from "vitest";
import { EDGE_CACHE_DEMO_PATH } from "./edge-cache-demo";

describe("EDGE_CACHE_DEMO_PATH", () => {
  it("points at a static asset path cacheable by Cloudflare CDN", () => {
    expect(EDGE_CACHE_DEMO_PATH).toBe("/edge-cache/demo.json");
  });
});
