import { registerTracing } from "@showcase/observability/tracing-runtime";

const tracingEnvironment = (): "development" | "production" =>
  process.env.NODE_ENV === "production" ? "production" : "development";

export const register = async (): Promise<void> => {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  registerTracing({
    serviceName: "showcase-web",
    environment: tracingEnvironment(),
    otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  });
};
