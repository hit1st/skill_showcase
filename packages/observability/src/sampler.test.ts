import { describe, expect, it } from "vitest";
import { shouldSampleTrace } from "./sampler";

describe("shouldSampleTrace", () => {
  it("samples all traces in development", () => {
    expect(
      shouldSampleTrace({
        environment: "development",
        route: "/",
        isError: false,
        traceId: "abc123",
      }),
    ).toBe(true);
  });

  it("always samples api routes in production", () => {
    expect(
      shouldSampleTrace({
        environment: "production",
        route: "/api/health",
        isError: false,
        traceId: "abc123",
      }),
    ).toBe(true);
  });

  it("always samples errors in production", () => {
    expect(
      shouldSampleTrace({
        environment: "production",
        route: "/",
        isError: true,
        traceId: "abc123",
      }),
    ).toBe(true);
  });

  it("applies deterministic head sampling for other production traffic", () => {
    const sampled = shouldSampleTrace({
      environment: "production",
      route: "/",
      isError: false,
      traceId: "0a".padEnd(32, "0"),
    });
    const skipped = shouldSampleTrace({
      environment: "production",
      route: "/",
      isError: false,
      traceId: "ff".padEnd(32, "f"),
    });

    expect(sampled).toBe(true);
    expect(skipped).toBe(false);
  });
});
