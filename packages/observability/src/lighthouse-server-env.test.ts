import { describe, expect, it } from "vitest";
import { buildLighthouseServerEnv } from "./lighthouse-server-env";

describe("buildLighthouseServerEnv", () => {
  it("disables Node OTel export for the Lighthouse production server", () => {
    expect(
      buildLighthouseServerEnv(
        { NODE_ENV: "production", CI: "true" },
        "3456",
      ),
    ).toEqual({
      NODE_ENV: "production",
      CI: "true",
      PORT: "3456",
      SHOWCASE_TRACING_PLATFORM: "cloudflare-workers",
    });
  });
});
