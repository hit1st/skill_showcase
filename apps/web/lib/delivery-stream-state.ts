import type { StreamEvent } from "@showcase/delivery-routes";

export type DeliveryStreamStatus = "idle" | "live" | "reconnecting" | "error";

export type DeliveryStreamState = {
  readonly events: readonly StreamEvent[];
  readonly reconnectCount: number;
  readonly paused: boolean;
  readonly status: DeliveryStreamStatus;
  readonly error: string | null;
};

export type ConnectionState = {
  readonly reconnectAttempt: number;
};

export type DeliveryStreamAction =
  | { readonly type: "reset" }
  | { readonly type: "connected" }
  | { readonly type: "segment"; readonly event: StreamEvent }
  | { readonly type: "disconnected" }
  | { readonly type: "resume" };

export const initialDeliveryStreamState = (): DeliveryStreamState => ({
  events: [],
  reconnectCount: 0,
  paused: false,
  status: "idle",
  error: null,
});

export const initialConnectionState = (): ConnectionState => ({
  reconnectAttempt: 0,
});

export const advanceReconnectAttempt = (state: ConnectionState): ConnectionState => ({
  reconnectAttempt: state.reconnectAttempt + 1,
});

export const resetConnectionState = (): ConnectionState => initialConnectionState();

const appendEvent = (
  events: readonly StreamEvent[],
  event: StreamEvent,
): readonly StreamEvent[] => [...events.slice(-5), event];

export const reduceDeliveryStreamState = (
  state: DeliveryStreamState,
  action: DeliveryStreamAction,
): DeliveryStreamState => {
  switch (action.type) {
    case "reset":
      return initialDeliveryStreamState();
    case "connected":
      return {
        ...state,
        status: "live",
        error: null,
      };
    case "segment": {
      const paused = action.event.bufferHealth < 45 ? true : state.paused;

      return {
        ...state,
        paused,
        events: appendEvent(state.events, action.event),
        status: paused ? "idle" : "live",
      };
    }
    case "disconnected":
      return {
        ...state,
        status: "reconnecting",
        reconnectCount: state.reconnectCount + 1,
        error: "stream disconnected",
      };
    case "resume":
      return {
        ...state,
        paused: false,
        status: "live",
        error: null,
      };
    default:
      return state;
  }
};
