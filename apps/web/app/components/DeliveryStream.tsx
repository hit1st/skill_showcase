"use client";

import { Button, StatusBadge } from "@showcase/design-system";
import { useDeliveryStream } from "@/lib/use-delivery-stream";

export const DeliveryStream = () => {
  const { state, start, resume } = useDeliveryStream();

  return (
    <div className="demonstrator">
      <p className="demonstrator-copy">
        Server-Sent Events with simulated first-connection failure, exponential reconnect,
        and client pause when buffer health drops.
      </p>
      <div className="demonstrator-actions">
        <Button onClick={start}>Start stream</Button>
        <Button onClick={resume} disabled={!state.paused}>
          Resume
        </Button>
      </div>
      <div className="stream-meta">
        <StatusBadge label={state.status} tone={state.error ? "danger" : "success"} />
        <StatusBadge label={`reconnects ${state.reconnectCount}`} tone="neutral" />
        {state.paused ? <StatusBadge label="paused (backpressure)" tone="danger" /> : null}
      </div>
      {state.error ? <p className="demonstrator-error">{state.error}</p> : null}
      <ul className="probe-results" aria-live="polite">
        {state.events.map((event) => (
          <li key={event.sequence}>
            <strong>segment {event.sequence}</strong>
            <span>
              {event.latencyMs}ms · buffer {event.bufferHealth}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
