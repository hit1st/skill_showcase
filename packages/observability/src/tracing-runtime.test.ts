import { describe, expect, it, afterEach } from "vitest";
import { context } from "@opentelemetry/api";
import {
  createTracingRuntime,
  createTracingStore,
  resetTracingRuntime,
} from "./tracing-runtime";

afterEach(() => {
  resetTracingRuntime();
});

describe("createTracingStore", () => {
  it("returns the same runtime when register is called twice", () => {
    const store = createTracingStore();
    const config = {
      serviceName: "showcase-web-test",
      environment: "development" as const,
      useInMemoryExporter: true,
    };

    const first = store.register(config);
    const second = store.register({
      ...config,
      serviceName: "other-service",
    });

    expect(second).toBe(first);
  });

  it("ensure lazily registers when no runtime exists", () => {
    const store = createTracingStore();

    const runtime = store.ensure({
      serviceName: "ensure-test",
      environment: "development",
      useInMemoryExporter: true,
    });

    expect(runtime.completedSpans).toBeDefined();
    expect(store.get()).toBe(runtime);
  });
});

describe("createTracingRuntime", () => {
  it("records nested edge and api spans with exported attributes", async () => {
    const runtime = createTracingRuntime({
      serviceName: "showcase-web-test",
      environment: "development",
      useInMemoryExporter: true,
    });

    await runtime.withSpan(
      "edge.request",
      { "http.route": "/api/health" },
      undefined,
      async () =>
        runtime.withSpan(
          "api.handler",
          { request_id: "req-1", demonstrator: "api" },
          context.active(),
          async () => "ok",
        ),
    );

    await runtime.forceFlush();

    const names = runtime
      .completedSpans()
      .map((span) => span.name)
      .sort();

    expect(names).toEqual(["api.handler", "edge.request"]);
    expect(runtime.completedSpans().find((span) => span.name === "api.handler")?.attributes).toEqual(
      expect.objectContaining({ request_id: "req-1" }),
    );

    await runtime.shutdown();
  });

  it("extracts parent context from traceparent headers", async () => {
    const runtime = createTracingRuntime({
      serviceName: "showcase-web-test",
      environment: "development",
      useInMemoryExporter: true,
    });

    const traceId = "4bf92f3577b34da6a3ce929d0e0e4736";
    const parentSpanId = "00f067aa0ba902b7";
    const carrier = {
      traceparent: `00-${traceId}-${parentSpanId}-01`,
    };

    await runtime.withSpan(
      "api.handler",
      { request_id: "req-2" },
      runtime.extractContext(carrier),
      () => "ok",
    );
    await runtime.forceFlush();

    const span = runtime.completedSpans().find((entry) => entry.name === "api.handler");

    expect(span?.traceId).toBe(traceId);

    await runtime.shutdown();
  });
});
