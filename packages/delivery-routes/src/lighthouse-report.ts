import type { LighthouseSummaryInput } from "./budget";

export type LighthouseReportInput = {
  readonly categories: {
    readonly performance: { readonly score: number | null };
    readonly accessibility: { readonly score: number | null };
  };
  readonly audits: Readonly<Record<string, { readonly numericValue?: number }>>;
};

const requiredAudits = [
  "largest-contentful-paint",
  "cumulative-layout-shift",
] as const;

const optionalAudits = ["interaction-to-next-paint"] as const;

const requireScore = (score: number | null, label: string): number => {
  if (score === null) {
    throw new Error(`missing lighthouse category score: ${label}`);
  }

  return score;
};

const requireAuditValue = (
  audits: LighthouseReportInput["audits"],
  id: string,
): number => {
  const value = audits[id]?.numericValue;

  if (value === undefined) {
    throw new Error(`missing lighthouse audit: ${id}`);
  }

  return value;
};

export const toLighthouseSummary = (
  report: LighthouseReportInput,
): LighthouseSummaryInput => ({
  performanceScore: requireScore(report.categories.performance.score, "performance"),
  accessibilityScore: requireScore(report.categories.accessibility.score, "accessibility"),
  audits: {
    ...Object.fromEntries(
      requiredAudits.map((id) => [id, { numericValue: requireAuditValue(report.audits, id) }]),
    ),
    ...Object.fromEntries(
      optionalAudits.map((id) => [
        id,
        { numericValue: report.audits[id]?.numericValue ?? 0 },
      ]),
    ),
  },
});
