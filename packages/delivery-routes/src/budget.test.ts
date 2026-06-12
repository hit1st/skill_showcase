import { describe, expect, it } from "vitest";
import { evaluateBudget, parseLighthouseSummary } from "./budget";

describe("parseLighthouseSummary", () => {
  it("extracts core web vitals from lighthouse summary json", () => {
    const summary = parseLighthouseSummary({
      performanceScore: 0.94,
      accessibilityScore: 0.96,
      audits: {
        "largest-contentful-paint": { numericValue: 2100 },
        "interaction-to-next-paint": { numericValue: 120 },
        "cumulative-layout-shift": { numericValue: 0.04 },
      },
    });

    expect(summary.performanceScore).toBe(94);
    expect(summary.accessibilityScore).toBe(96);
    expect(summary.lcpMs).toBe(2100);
    expect(summary.inpMs).toBe(120);
    expect(summary.cls).toBe(0.04);
  });

  it("throws when required audit fields are missing", () => {
    expect(() =>
      parseLighthouseSummary({ performanceScore: 1, accessibilityScore: 1, audits: {} }),
    ).toThrow(/missing/i);
  });
});

describe("evaluateBudget", () => {
  it("passes when metrics meet showcase thresholds", () => {
    const snapshot = parseLighthouseSummary({
      performanceScore: 0.94,
      accessibilityScore: 0.96,
      audits: {
        "largest-contentful-paint": { numericValue: 2100 },
        "interaction-to-next-paint": { numericValue: 120 },
        "cumulative-layout-shift": { numericValue: 0.04 },
      },
    });

    expect(evaluateBudget(snapshot)).toEqual({ ok: true, failures: [] });
  });

  it("fails when accessibility score is below 95", () => {
    const result = evaluateBudget({
      performanceScore: 94,
      accessibilityScore: 90,
      lcpMs: 1800,
      inpMs: 100,
      cls: 0.02,
    });

    expect(result.ok).toBe(false);
    expect(result.failures).toContain("accessibility score below 95");
  });

  it("fails when performance score is below 90", () => {
    const result = evaluateBudget({
      performanceScore: 80,
      accessibilityScore: 96,
      lcpMs: 1800,
      inpMs: 100,
      cls: 0.02,
    });

    expect(result.ok).toBe(false);
    expect(result.failures).toContain("performance score below 90");
  });
});
