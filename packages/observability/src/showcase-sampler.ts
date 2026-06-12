import {
  SamplingDecision,
  type Sampler,
  type SamplingResult,
} from "@opentelemetry/sdk-trace-base";
import type { Context } from "@opentelemetry/api";
import { shouldSampleTrace, type SamplingInput } from "./sampler";
import type { TracingEnvironment } from "./tracing-runtime";

const toSamplingInput = (
  environment: TracingEnvironment,
  traceId: string,
  attributes: Record<string, unknown>,
): SamplingInput => {
  const status = attributes["http.status_code"];
  const isError = status === 500 || status === 503;

  return {
    environment,
    route: String(attributes["http.route"] ?? "/"),
    isError,
    traceId,
  };
};

export const createShowcaseSampler = (environment: TracingEnvironment): Sampler => ({
  shouldSample: (
    _context: Context,
    traceId: string,
    _spanName: string,
    _spanKind: unknown,
    attributes: Record<string, unknown>,
  ): SamplingResult => ({
    decision: shouldSampleTrace(toSamplingInput(environment, traceId, attributes))
      ? SamplingDecision.RECORD_AND_SAMPLED
      : SamplingDecision.NOT_RECORD,
  }),
  toString: () => `ShowcaseSampler(${environment})`,
});
