import { describe, expect, it } from "vitest";
import { requiresOtlpReadinessCheck } from "./readiness-policy";

describe("requiresOtlpReadinessCheck", () => {
  it("requires OTLP when running on the Node tracing platform", () => {
    expect(requiresOtlpReadinessCheck({ NEXT_RUNTIME: "nodejs" })).toBe(true);
  });

  it("skips OTLP when Workers noop tracing is active", () => {
    expect(
      requiresOtlpReadinessCheck({
        NEXT_RUNTIME: "nodejs",
        SHOWCASE_TRACING_PLATFORM: "cloudflare-workers",
      }),
    ).toBe(false);
  });
});
