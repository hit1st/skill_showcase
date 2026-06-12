import { describe, expect, it } from "vitest";
import {
  advanceReconnectAttempt,
  initialConnectionState,
  initialDeliveryStreamState,
  reduceDeliveryStreamState,
} from "./delivery-stream-state";
import type { StreamEvent } from "@showcase/delivery-routes";

const segment = (sequence: number, bufferHealth: number): StreamEvent => ({
  type: "segment",
  sequence,
  latencyMs: 50,
  bufferHealth,
  timestamp: "2026-01-01T00:00:00.000Z",
});

describe("reduceDeliveryStreamState", () => {
  it("resets to the initial state", () => {
    const current = reduceDeliveryStreamState(
      {
        ...initialDeliveryStreamState(),
        reconnectCount: 2,
        status: "reconnecting",
      },
      { type: "reset" },
    );

    expect(current).toEqual(initialDeliveryStreamState());
  });

  it("pauses when buffer health drops below threshold", () => {
    const live = reduceDeliveryStreamState(initialDeliveryStreamState(), {
      type: "connected",
    });
    const paused = reduceDeliveryStreamState(live, {
      type: "segment",
      event: segment(1, 40),
    });

    expect(paused.paused).toBe(true);
    expect(paused.status).toBe("idle");
    expect(paused.events).toHaveLength(1);
  });

  it("increments reconnect count on disconnect", () => {
    const disconnected = reduceDeliveryStreamState(
      reduceDeliveryStreamState(initialDeliveryStreamState(), { type: "connected" }),
      { type: "disconnected" },
    );

    expect(disconnected.status).toBe("reconnecting");
    expect(disconnected.reconnectCount).toBe(1);
    expect(disconnected.error).toBe("stream disconnected");
  });
});

describe("advanceReconnectAttempt", () => {
  it("returns the next attempt count immutably", () => {
    const first = advanceReconnectAttempt(initialConnectionState());
    const second = advanceReconnectAttempt(first);

    expect(first.reconnectAttempt).toBe(1);
    expect(second.reconnectAttempt).toBe(2);
  });
});
