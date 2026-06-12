import { describe, expect, it } from "vitest";
import {
  apiHandlerAttributes,
  edgeRequestAttributes,
  originAssetAttributes,
  originRouteAttributes,
  sseStreamAttributes,
} from "./span-attributes";

describe("span attribute builders", () => {
  it("builds edge request attributes", () => {
    expect(edgeRequestAttributes("GET", "/api/health")).toEqual({
      "http.method": "GET",
      "http.route": "/api/health",
    });
  });

  it("builds api handler attributes", () => {
    expect(apiHandlerAttributes("/api/health", "req-123")).toEqual({
      demonstrator: "api",
      "http.route": "/api/health",
      request_id: "req-123",
    });
  });

  it("builds origin asset attributes", () => {
    expect(
      originAssetAttributes({
        cacheControl: "public, max-age=3600",
        cacheStatus: "HIT",
      }),
    ).toEqual({
      "cache.control": "public, max-age=3600",
      "cache.status": "HIT",
    });
  });

  it("builds origin route attributes", () => {
    expect(originRouteAttributes("origin.primary", 503, true)).toEqual({
      "failover.triggered": true,
      "http.status_code": 503,
      "origin.route": "origin.primary",
    });
  });

  it("builds sse stream attributes", () => {
    expect(sseStreamAttributes({ failOnce: true, status: 503 })).toEqual({
      "sse.fail_once": true,
      "http.status_code": 503,
    });
  });
});
