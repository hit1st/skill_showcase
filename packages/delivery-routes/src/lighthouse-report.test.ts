import { describe, expect, it } from "vitest";
import { toLighthouseSummary } from "./lighthouse-report";

describe("toLighthouseSummary", () => {
  it("maps lighthouse report categories and audits into summary json", () => {
    const summary = toLighthouseSummary({
      categories: {
        performance: { score: 0.94 },
        accessibility: { score: 0.96 },
      },
      audits: {
        "largest-contentful-paint": { numericValue: 2100 },
        "interaction-to-next-paint": { numericValue: 120 },
        "cumulative-layout-shift": { numericValue: 0.04 },
      },
    });

    expect(summary).toEqual({
      performanceScore: 0.94,
      accessibilityScore: 0.96,
      audits: {
        "largest-contentful-paint": { numericValue: 2100 },
        "interaction-to-next-paint": { numericValue: 120 },
        "cumulative-layout-shift": { numericValue: 0.04 },
      },
    });
  });

  it("defaults INP to zero when the audit is absent", () => {
    const summary = toLighthouseSummary({
      categories: {
        performance: { score: 0.94 },
        accessibility: { score: 0.96 },
      },
      audits: {
        "largest-contentful-paint": { numericValue: 2100 },
        "cumulative-layout-shift": { numericValue: 0.04 },
      },
    });

    expect(summary.audits["interaction-to-next-paint"]).toEqual({ numericValue: 0 });
  });

  it("throws when lighthouse category scores are missing", () => {
    expect(() =>
      toLighthouseSummary({
        categories: {
          performance: { score: null },
          accessibility: { score: 0.96 },
        },
        audits: {},
      }),
    ).toThrow(/performance/i);
  });
});
