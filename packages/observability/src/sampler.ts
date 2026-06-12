export type SamplingInput = {
  readonly environment: "development" | "production";
  readonly route: string;
  readonly isError: boolean;
  readonly traceId: string;
};

const PRODUCTION_HEAD_SAMPLE_THRESHOLD = 26;

const normalizedTraceBucket = (traceId: string): number => {
  const prefix = traceId.replace(/[^a-f0-9]/gi, "").slice(0, 2).padEnd(2, "0");
  return Number.parseInt(prefix, 16);
};

export const shouldSampleTrace = (input: SamplingInput): boolean => {
  if (input.environment === "development") {
    return true;
  }

  if (input.isError || input.route.startsWith("/api/")) {
    return true;
  }

  return normalizedTraceBucket(input.traceId) < PRODUCTION_HEAD_SAMPLE_THRESHOLD;
};
