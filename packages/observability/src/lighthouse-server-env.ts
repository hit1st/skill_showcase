export const buildLighthouseServerEnv = (
  env: Readonly<Record<string, string | undefined>>,
  port: string,
): Readonly<Record<string, string | undefined>> => ({
  ...env,
  PORT: port,
  SHOWCASE_TRACING_PLATFORM: "cloudflare-workers",
});
