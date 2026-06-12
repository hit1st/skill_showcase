import { IMPLEMENTED_ROUTES, isDeliveryRouteRegistered } from "@showcase/delivery-routes";
import {
  checkReady,
  createLogger,
  createMetricsRegistry,
  requiresOtlpReadinessCheck,
  type Logger,
  type MetricsRegistry,
} from "@showcase/observability";

const SERVICE_NAME = "showcase-web";

type ObservabilityRuntime = {
  readonly metrics: MetricsRegistry;
  readonly logger: Logger;
};

const createObservabilityRuntime = (): ObservabilityRuntime => ({
  metrics: createMetricsRegistry(),
  logger: createLogger({ service: SERVICE_NAME }),
});

const runtime = createObservabilityRuntime();

export const getMetricsRegistry = (): MetricsRegistry => runtime.metrics;

export const getLogger = (): Logger => runtime.logger;

export const getRegisteredRoutes = (): readonly string[] => IMPLEMENTED_ROUTES;

const defaultOtlpEndpoint = (): string =>
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://127.0.0.1:4318";

export const probeOtlpReachable = async (
  endpoint: string = defaultOtlpEndpoint(),
): Promise<boolean> => {
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      signal: AbortSignal.timeout(750),
    });

    return response.status < 500;
  } catch {
    return false;
  }
};

export const evaluateReadiness = async () => {
  const otlpReachable = requiresOtlpReadinessCheck()
    ? await probeOtlpReachable()
    : true;

  return checkReady({
    otlpReachable,
    routesRegistered: isDeliveryRouteRegistered(getRegisteredRoutes()),
  });
};

export const recordApiRequest = (input: {
  readonly route: string;
  readonly method: string;
  readonly status: number;
  readonly durationMs: number;
  readonly traceId: string;
  readonly requestId: string;
}): void => {
  getMetricsRegistry().recordRequest({
    route: input.route,
    method: input.method,
    status: input.status,
    durationMs: input.durationMs,
  });

  getLogger().info("request completed", {
    trace_id: input.traceId,
    request_id: input.requestId,
  });
};
