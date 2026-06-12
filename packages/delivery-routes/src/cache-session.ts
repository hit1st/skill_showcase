export type CacheSessionState = {
  readonly requestCount: number;
};

export const initialCacheSession = (): CacheSessionState => ({
  requestCount: 0,
});

export const advanceCacheSession = (
  state: CacheSessionState,
): { readonly next: CacheSessionState; readonly requestCount: number } => {
  const requestCount = state.requestCount + 1;

  return {
    next: { requestCount },
    requestCount,
  };
};

export type CacheSessionStore = {
  readonly nextRequestCount: () => number;
  readonly snapshot: () => CacheSessionState;
};

export const createCacheSessionStore = (
  initial: CacheSessionState = initialCacheSession(),
): CacheSessionStore => {
  let state = initial;

  return {
    nextRequestCount: (): number => {
      const advanced = advanceCacheSession(state);
      state = advanced.next;
      return advanced.requestCount;
    },
    snapshot: (): CacheSessionState => state,
  };
};
