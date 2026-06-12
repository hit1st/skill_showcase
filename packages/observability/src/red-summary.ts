import type { MetricsSnapshot } from "./metrics";

export type RedSummary = {
  readonly requestTotal: number;
  readonly errorTotal: number;
  readonly errorRate: number;
  readonly averageLatencyMs: number;
};

const sumValues = <T extends { readonly value: number }>(
  entries: readonly T[],
): number => entries.reduce((total, entry) => total + entry.value, 0);

export const deriveRedSummary = (snapshot: MetricsSnapshot): RedSummary => {
  const requestTotal = sumValues(snapshot.http_requests_total);
  const errorTotal = sumValues(snapshot.http_request_errors_total);
  const { count, sum } = snapshot.http_request_duration_seconds;

  return {
    requestTotal,
    errorTotal,
    errorRate: requestTotal === 0 ? 0 : errorTotal / requestTotal,
    averageLatencyMs: count === 0 ? 0 : (sum / count) * 1000,
  };
};
