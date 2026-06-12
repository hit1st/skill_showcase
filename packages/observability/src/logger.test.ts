import { describe, expect, it } from "vitest";
import { createLogger, type LogRecord } from "./logger";

describe("createLogger", () => {
  it("emits structured JSON with correlation fields", () => {
    const lines: string[] = [];
    const logger = createLogger({
      service: "showcase-web",
      write: (line) => lines.push(line),
    });

    logger.info("request completed", {
      trace_id: "trace-abc",
      span_id: "span-def",
      request_id: "req-123",
    });

    expect(lines).toHaveLength(1);
    const record = JSON.parse(lines[0]!) as LogRecord;
    expect(record.level).toBe("info");
    expect(record.message).toBe("request completed");
    expect(record.trace_id).toBe("trace-abc");
    expect(record.span_id).toBe("span-def");
    expect(record.request_id).toBe("req-123");
    expect(record.service).toBe("showcase-web");
    expect(typeof record.timestamp).toBe("string");
  });
});
