import { describe, expect, it } from "vitest";
import {
  advanceCacheSession,
  createCacheSessionStore,
  initialCacheSession,
} from "./cache-session";

describe("advanceCacheSession", () => {
  it("returns incremented request count and next immutable state", () => {
    const first = advanceCacheSession(initialCacheSession());
    const second = advanceCacheSession(first.next);

    expect(first.requestCount).toBe(1);
    expect(second.requestCount).toBe(2);
    expect(first.next).not.toBe(second.next);
  });
});

describe("createCacheSessionStore", () => {
  it("records monotonic request counts via pure transitions", () => {
    const store = createCacheSessionStore();

    expect(store.nextRequestCount()).toBe(1);
    expect(store.nextRequestCount()).toBe(2);
    expect(store.snapshot()).toEqual({ requestCount: 2 });
  });
});
