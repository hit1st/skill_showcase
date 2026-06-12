import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import {
  context,
  propagation,
  trace,
  type Context,
} from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  AlwaysOnSampler,
  BatchSpanProcessor,
  InMemorySpanExporter,
  ParentBasedSampler,
  SimpleSpanProcessor,
  type SpanExporter,
} from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { createShowcaseSampler } from "./showcase-sampler";
import type { SpanAttributes } from "./span-attributes";

export type TracingEnvironment = "development" | "production";

export type TracingConfig = {
  readonly serviceName: string;
  readonly environment: TracingEnvironment;
  readonly otlpEndpoint?: string;
  readonly useInMemoryExporter?: boolean;
};

export type CompletedSpan = {
  readonly name: string;
  readonly traceId: string;
  readonly attributes: SpanAttributes;
};

export type TracingRuntime = {
  readonly withSpan: <T>(
    name: string,
    attributes: SpanAttributes,
    parentContext: Context | undefined,
    fn: () => T | Promise<T>,
  ) => Promise<T>;
  readonly extractContext: (carrier: Readonly<Record<string, string>>) => Context;
  readonly forceFlush: () => Promise<void>;
  readonly shutdown: () => Promise<void>;
  readonly completedSpans: () => readonly CompletedSpan[];
};

const defaultOtlpEndpoint = (): string =>
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://127.0.0.1:4318";

const toCompletedSpan = (
  span: ReturnType<InMemorySpanExporter["getFinishedSpans"]>[number],
): CompletedSpan => ({
  name: span.name,
  traceId: span.spanContext().traceId,
  attributes: Object.fromEntries(
    Object.entries(span.attributes).map(([key, value]) => [key, value as string | number | boolean]),
  ),
});

const TRACING_RUNTIME_KEY = Symbol.for("showcase.tracingRuntime");

type GlobalTracingState = typeof globalThis & {
  [TRACING_RUNTIME_KEY]?: TracingRuntime;
};

const readGlobalRuntime = (): TracingRuntime | undefined =>
  (globalThis as GlobalTracingState)[TRACING_RUNTIME_KEY];

const writeGlobalRuntime = (runtime: TracingRuntime): void => {
  (globalThis as GlobalTracingState)[TRACING_RUNTIME_KEY] = runtime;
};

export const createTracingRuntime = (config: TracingConfig): TracingRuntime => {
  const inMemoryExporter = config.useInMemoryExporter
    ? new InMemorySpanExporter()
    : undefined;

  const exporter: SpanExporter = inMemoryExporter
    ?? new OTLPTraceExporter({
      url: `${config.otlpEndpoint ?? defaultOtlpEndpoint()}/v1/traces`,
    });

  const provider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: config.serviceName,
    }),
    sampler: config.useInMemoryExporter
      ? new AlwaysOnSampler()
      : new ParentBasedSampler({
          root: createShowcaseSampler(config.environment),
        }),
    spanProcessors: [
      config.useInMemoryExporter || config.environment === "development"
        ? new SimpleSpanProcessor(exporter)
        : new BatchSpanProcessor(exporter),
    ],
  });

  provider.register({
    propagator: new W3CTraceContextPropagator(),
    contextManager: new AsyncLocalStorageContextManager().enable(),
  });

  const tracer = provider.getTracer(config.serviceName);

  const withSpan = async <T>(
    name: string,
    attributes: SpanAttributes,
    parentContext: Context | undefined,
    fn: () => T | Promise<T>,
  ): Promise<T> => {
    const activeContext = parentContext ?? context.active();
    const span = tracer.startSpan(name, { attributes }, activeContext);

    return context.with(trace.setSpan(activeContext, span), async () => {
      try {
        return await fn();
      } finally {
        span.end();
      }
    });
  };

  const extractContext = (carrier: Readonly<Record<string, string>>): Context =>
    propagation.extract(context.active(), carrier);

  return {
    withSpan,
    extractContext,
    forceFlush: () => provider.forceFlush(),
    shutdown: () => provider.shutdown(),
    completedSpans: () =>
      (inMemoryExporter?.getFinishedSpans() ?? []).map(toCompletedSpan),
  };
};

let registeredRuntime: TracingRuntime | undefined;

export const registerTracing = (config: TracingConfig): TracingRuntime => {
  const existing = readGlobalRuntime();

  if (existing) {
    registeredRuntime = existing;
    return existing;
  }

  const runtime = createTracingRuntime(config);
  writeGlobalRuntime(runtime);
  registeredRuntime = runtime;
  return runtime;
};

export const getTracingRuntime = (): TracingRuntime => {
  const runtime = readGlobalRuntime() ?? registeredRuntime;

  if (!runtime) {
    throw new Error("tracing runtime is not registered");
  }

  return runtime;
};

export const resetTracingRuntime = (): void => {
  registeredRuntime = undefined;
  delete (globalThis as GlobalTracingState)[TRACING_RUNTIME_KEY];
};

const defaultEnvironment = (): TracingEnvironment =>
  process.env.NODE_ENV === "production" ? "production" : "development";

export const ensureTracingRegistered = (
  config: Partial<TracingConfig> = {},
): TracingRuntime => {
  const existing = readGlobalRuntime() ?? registeredRuntime;

  if (existing) {
    return existing;
  }

  return registerTracing({
    serviceName: config.serviceName ?? "showcase-web",
    environment: config.environment ?? defaultEnvironment(),
    otlpEndpoint: config.otlpEndpoint ?? process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  });
};
