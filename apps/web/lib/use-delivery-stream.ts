"use client";

import {
  computeReconnectDelayMs,
  DELIVERY_ROUTES,
  type StreamEvent,
} from "@showcase/delivery-routes";
import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  advanceReconnectAttempt,
  initialConnectionState,
  initialDeliveryStreamState,
  reduceDeliveryStreamState,
  resetConnectionState,
  type ConnectionState,
  type DeliveryStreamState,
} from "@/lib/delivery-stream-state";

const parseStreamEvent = (raw: string): StreamEvent | null => {
  try {
    return JSON.parse(raw) as StreamEvent;
  } catch {
    return null;
  }
};

type StreamHandles = {
  readonly source: EventSource | null;
  readonly reconnectTimer: number | null;
};

const emptyHandles = (): StreamHandles => ({
  source: null,
  reconnectTimer: null,
});

/**
 * Browser EventSource and timers are imperative platform APIs. State transitions
 * stay pure in reduceDeliveryStreamState; this hook only owns I/O handles.
 */
export const useDeliveryStream = (): {
  readonly state: DeliveryStreamState;
  readonly start: () => void;
  readonly resume: () => void;
} => {
  const [state, dispatch] = useReducer(
    reduceDeliveryStreamState,
    undefined,
    initialDeliveryStreamState,
  );
  const handlesRef = useRef<StreamHandles>(emptyHandles());
  const connectionRef = useRef<ConnectionState>(initialConnectionState());

  const clearReconnectTimer = useCallback((): void => {
    if (handlesRef.current.reconnectTimer !== null) {
      window.clearTimeout(handlesRef.current.reconnectTimer);
      handlesRef.current = { ...handlesRef.current, reconnectTimer: null };
    }
  }, []);

  const closeSource = useCallback((): void => {
    handlesRef.current.source?.close();
    handlesRef.current = { ...handlesRef.current, source: null };
  }, []);

  const connect = useCallback(
    (failOnce: boolean) => {
      closeSource();
      clearReconnectTimer();

      const query = failOnce ? "?failOnce=1" : "";
      const source = new EventSource(`${DELIVERY_ROUTES.stream}${query}`);
      handlesRef.current = { ...handlesRef.current, source };

      dispatch({ type: "connected" });

      source.addEventListener("segment", (message) => {
        const event = parseStreamEvent(message.data);

        if (!event) {
          return;
        }

        dispatch({ type: "segment", event });

        if (event.bufferHealth < 45) {
          closeSource();
        }
      });

      source.onerror = () => {
        closeSource();
        const attempt = connectionRef.current.reconnectAttempt;
        connectionRef.current = advanceReconnectAttempt(connectionRef.current);
        dispatch({ type: "disconnected" });

        const timer = window.setTimeout(() => {
          connect(false);
        }, computeReconnectDelayMs(attempt));

        handlesRef.current = { ...handlesRef.current, reconnectTimer: timer };
      };
    },
    [clearReconnectTimer, closeSource],
  );

  useEffect(
    () => () => {
      clearReconnectTimer();
      closeSource();
    },
    [clearReconnectTimer, closeSource],
  );

  const start = useCallback((): void => {
    connectionRef.current = resetConnectionState();
    dispatch({ type: "reset" });
    connect(true);
  }, [connect]);

  const resume = useCallback((): void => {
    connectionRef.current = resetConnectionState();
    dispatch({ type: "resume" });
    connect(false);
  }, [connect]);

  return { state, start, resume };
};
