export type LighthouseSummaryInput = {
  readonly performanceScore: number;
  readonly audits: Readonly<Record<string, { readonly numericValue?: number }>>;
};

export type BudgetSnapshot = {
  readonly performanceScore: number;
  readonly lcpMs: number;
  readonly inpMs: number;
  readonly cls: number;
};

const auditValue = (
  audits: LighthouseSummaryInput["audits"],
  id: string,
): number => {
  const value = audits[id]?.numericValue;

  if (value === undefined) {
    throw new Error(`missing lighthouse audit: ${id}`);
  }

  return value;
};

export const parseLighthouseSummary = (input: LighthouseSummaryInput): BudgetSnapshot => ({
  performanceScore: Math.round(input.performanceScore * 100),
  lcpMs: auditValue(input.audits, "largest-contentful-paint"),
  inpMs: auditValue(input.audits, "interaction-to-next-paint"),
  cls: auditValue(input.audits, "cumulative-layout-shift"),
});

export const evaluateBudget = (
  snapshot: BudgetSnapshot,
): { readonly ok: boolean; readonly failures: readonly string[] } => {
  const failures = [
    snapshot.performanceScore < 90 ? "performance score below 90" : null,
    snapshot.lcpMs > 2500 ? "LCP above 2.5s" : null,
    snapshot.cls > 0.1 ? "CLS above 0.1" : null,
  ].filter((item): item is string => item !== null);

  return { ok: failures.length === 0, failures };
};
