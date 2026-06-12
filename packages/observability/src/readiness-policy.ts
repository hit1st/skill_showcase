import { resolveTracingPlatform } from "./tracing-platform";

export const requiresOtlpReadinessCheck = (
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean => resolveTracingPlatform(env) === "nodejs";
