export type StreamEvent = {
  readonly type: "segment";
  readonly sequence: number;
  readonly latencyMs: number;
  readonly bufferHealth: number;
  readonly timestamp: string;
};

export const STREAM_EVENT_COUNT = 8;

export type StreamFailureState = {
  readonly hasFailedOnce: boolean;
};

const latencyForSequence = (sequence: number): number =>
  40 + ((sequence * 17) % 90);

const bufferHealthForSequence = (sequence: number): number =>
  Math.max(35, 100 - ((sequence * 11) % 55));

export const createStreamEvent = (sequence: number): StreamEvent => ({
  type: "segment",
  sequence,
  latencyMs: latencyForSequence(sequence),
  bufferHealth: bufferHealthForSequence(sequence),
  timestamp: new Date().toISOString(),
});

export const createStreamEventSequence = (
  count: number,
  startSequence = 1,
): readonly StreamEvent[] =>
  Array.from({ length: count }, (_, index) => createStreamEvent(startSequence + index));

export const computeReconnectDelayMs = (attempt: number): number =>
  Math.min(8000, 500 * 2 ** attempt);

export const formatSseEvent = (event: StreamEvent): string =>
  `event: segment\ndata: ${JSON.stringify(event)}\n\n`;

export const formatSseEvents = (events: readonly StreamEvent[]): readonly string[] =>
  events.map(formatSseEvent);

export const initialStreamFailureState = (): StreamFailureState => ({
  hasFailedOnce: false,
});

export const evaluateStreamFailure = (
  failOnce: boolean,
  state: StreamFailureState,
): { readonly next: StreamFailureState; readonly fail: boolean } => {
  if (!failOnce || state.hasFailedOnce) {
    return { next: state, fail: false };
  }

  return {
    next: { hasFailedOnce: true },
    fail: true,
  };
};

export type StreamFailureStore = {
  readonly evaluate: (failOnce: boolean) => { readonly fail: boolean };
};

export const createStreamFailureStore = (
  initial: StreamFailureState = initialStreamFailureState(),
): StreamFailureStore => {
  let state = initial;

  return {
    evaluate: (failOnce: boolean) => {
      const result = evaluateStreamFailure(failOnce, state);
      state = result.next;
      return { fail: result.fail };
    },
  };
};

/**
 * Web Streams API requires callback-driven enqueue/close. Event payloads are
 * precomputed; only delivery timing uses setInterval at this boundary.
 */
export const createTimedSseStream = (
  frames: readonly string[],
  intervalMs: number,
): ReadableStream<Uint8Array> =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      let delivered = 0;

      const deliverNext = (): void => {
        if (delivered >= frames.length) {
          controller.close();
          return;
        }

        controller.enqueue(encoder.encode(frames[delivered]!));
        delivered += 1;

        if (delivered >= frames.length) {
          controller.close();
        }
      };

      deliverNext();

      if (frames.length <= 1) {
        return;
      }

      const interval = setInterval(() => {
        if (delivered >= frames.length) {
          clearInterval(interval);
          return;
        }

        deliverNext();
      }, intervalMs);
    },
  });
