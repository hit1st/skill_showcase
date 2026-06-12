export type RequestMetricInput = {
  readonly route: string;
  readonly method: string;
  readonly status: number;
  readonly durationMs: number;
};

type CounterKey = {
  readonly route: string;
  readonly method: string;
  readonly status: number;
};

type ErrorKey = {
  readonly route: string;
};

export type MetricsSnapshot = {
  readonly http_requests_total: readonly {
    readonly route: string;
    readonly method: string;
    readonly status: number;
    readonly value: number;
  }[];
  readonly http_request_errors_total: readonly {
    readonly route: string;
    readonly value: number;
  }[];
  readonly http_request_duration_seconds: {
    readonly count: number;
    readonly sum: number;
  };
};

export type MetricsRegistry = {
  readonly recordRequest: (input: RequestMetricInput) => void;
  readonly snapshot: () => MetricsSnapshot;
};

const counterKey = (input: RequestMetricInput): string =>
  `${input.method}:${input.route}:${input.status}`;

const errorKey = (route: string): string => route;

const incrementCounter = (
  totals: Readonly<Record<string, CounterKey & { value: number }>>,
  input: RequestMetricInput,
): Readonly<Record<string, CounterKey & { value: number }>> => {
  const key = counterKey(input);
  const existing = totals[key];

  return {
    ...totals,
    [key]: {
      route: input.route,
      method: input.method,
      status: input.status,
      value: (existing?.value ?? 0) + 1,
    },
  };
};

const incrementError = (
  totals: Readonly<Record<string, ErrorKey & { value: number }>>,
  input: RequestMetricInput,
): Readonly<Record<string, ErrorKey & { value: number }>> => {
  if (input.status < 500) {
    return totals;
  }

  const key = errorKey(input.route);
  const existing = totals[key];

  return {
    ...totals,
    [key]: {
      route: input.route,
      value: (existing?.value ?? 0) + 1,
    },
  };
};

const accumulateDuration = (
  duration: MetricsSnapshot["http_request_duration_seconds"],
  input: RequestMetricInput,
): MetricsSnapshot["http_request_duration_seconds"] => ({
  count: duration.count + 1,
  sum: duration.sum + input.durationMs / 1000,
});

type MetricsAccumulator = {
  readonly requestTotals: Readonly<Record<string, CounterKey & { value: number }>>;
  readonly errorTotals: Readonly<Record<string, ErrorKey & { value: number }>>;
  readonly duration: MetricsSnapshot["http_request_duration_seconds"];
};

const initialAccumulator = (): MetricsAccumulator => ({
  requestTotals: {},
  errorTotals: {},
  duration: { count: 0, sum: 0 },
});

const foldMetricsEvent = (
  accumulator: MetricsAccumulator,
  event: RequestMetricInput,
): MetricsAccumulator => ({
  requestTotals: incrementCounter(accumulator.requestTotals, event),
  errorTotals: incrementError(accumulator.errorTotals, event),
  duration: accumulateDuration(accumulator.duration, event),
});

const toSnapshot = (accumulator: MetricsAccumulator): MetricsSnapshot => ({
  http_requests_total: Object.values(accumulator.requestTotals).map(
    ({ route, method, status, value }) => ({ route, method, status, value }),
  ),
  http_request_errors_total: Object.values(accumulator.errorTotals).map(
    ({ route, value }) => ({ route, value }),
  ),
  http_request_duration_seconds: accumulator.duration,
});

export const deriveMetricsSnapshot = (
  events: readonly RequestMetricInput[],
): MetricsSnapshot =>
  toSnapshot(events.reduce(foldMetricsEvent, initialAccumulator()));

export const createMetricsRegistry = (): MetricsRegistry => {
  const events: RequestMetricInput[] = [];

  return {
    recordRequest: (input: RequestMetricInput): void => {
      events.push(input);
    },
    snapshot: (): MetricsSnapshot => deriveMetricsSnapshot(events),
  };
};
