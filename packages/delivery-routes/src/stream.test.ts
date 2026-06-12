import { describe, expect, it } from "vitest";
import {
  computeReconnectDelayMs,
  createStreamEvent,
  createStreamEventSequence,
  evaluateStreamFailure,
  formatSseEvents,
  initialStreamFailureState,
  STREAM_EVENT_COUNT,
} from "./stream";

describe("createStreamEvent", () => {
  it("emits segment latency and buffer health", () => {
    const event = createStreamEvent(3);

    expect(event.sequence).toBe(3);
    expect(event.type).toBe("segment");
    expect(event.latencyMs).toBeGreaterThan(0);
    expect(event.bufferHealth).toBeGreaterThanOrEqual(0);
    expect(event.bufferHealth).toBeLessThanOrEqual(100);
  });
});

describe("computeReconnectDelayMs", () => {
  it("applies exponential backoff capped at eight seconds", () => {
    expect(computeReconnectDelayMs(0)).toBe(500);
    expect(computeReconnectDelayMs(1)).toBe(1000);
    expect(computeReconnectDelayMs(5)).toBe(8000);
  });
});

describe("createStreamEventSequence", () => {
  it("builds a fixed-length pure event sequence", () => {
    const events = createStreamEventSequence(STREAM_EVENT_COUNT);

    expect(events).toHaveLength(STREAM_EVENT_COUNT);
    expect(events.map((event) => event.sequence)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe("formatSseEvents", () => {
  it("formats each event as an SSE frame", () => {
    const [frame] = formatSseEvents(createStreamEventSequence(1));

    expect(frame).toMatch(/^event: segment\ndata: /);
    expect(frame).toMatch(/\n\n$/);
  });
});

describe("evaluateStreamFailure", () => {
  it("fails once when failOnce is requested", () => {
    const first = evaluateStreamFailure(true, initialStreamFailureState());
    const second = evaluateStreamFailure(true, first.next);

    expect(first.fail).toBe(true);
    expect(second.fail).toBe(false);
    expect(second.next.hasFailedOnce).toBe(true);
  });

  it("does not fail when failOnce is false", () => {
    const result = evaluateStreamFailure(false, initialStreamFailureState());

    expect(result.fail).toBe(false);
    expect(result.next.hasFailedOnce).toBe(false);
  });
});
