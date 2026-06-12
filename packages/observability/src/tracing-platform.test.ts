import { describe, expect, it } from "vitest";
import { resolveTracingPlatform } from "./tracing-platform";

describe("resolveTracingPlatform", () => {
  it("uses node tracing on the Node.js Next.js runtime", () => {
    expect(
      resolveTracingPlatform({
        NEXT_RUNTIME: "nodejs",
      }),
    ).toBe("nodejs");
  });

  it("uses noop tracing on Cloudflare Workers", () => {
    expect(
      resolveTracingPlatform({
        NEXT_RUNTIME: "nodejs",
        SHOWCASE_TRACING_PLATFORM: "cloudflare-workers",
      }),
    ).toBe("cloudflare-workers");
  });

  it("uses noop tracing when Next.js edge runtime is active", () => {
    expect(
      resolveTracingPlatform({
        NEXT_RUNTIME: "edge",
      }),
    ).toBe("cloudflare-workers");
  });

  it("defaults to node tracing when NEXT_RUNTIME is unset", () => {
    expect(resolveTracingPlatform({})).toBe("nodejs");
  });
});
