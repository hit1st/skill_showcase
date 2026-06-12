import { describe, expect, it } from "vitest";
import { extractTraceHeaders } from "./trace-headers";

describe("extractTraceHeaders", () => {
  it("reads x-trace-id and x-request-id from response headers", () => {
    const headers = new Headers({
      "x-trace-id": "abc123",
      "x-request-id": "req456",
    });

    expect(extractTraceHeaders(headers)).toEqual({
      traceId: "abc123",
      requestId: "req456",
    });
  });

  it("returns null fields when headers are missing", () => {
    expect(extractTraceHeaders(new Headers())).toEqual({
      traceId: null,
      requestId: null,
    });
  });
});
