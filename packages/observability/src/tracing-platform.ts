export type TracingPlatform = "nodejs" | "cloudflare-workers";

export const resolveTracingPlatform = (
  env: Readonly<Record<string, string | undefined>> = process.env,
): TracingPlatform => {
  if (env.SHOWCASE_TRACING_PLATFORM === "cloudflare-workers") {
    return "cloudflare-workers";
  }

  if (env.NEXT_RUNTIME !== "nodejs") {
    return "cloudflare-workers";
  }

  return "nodejs";
};
