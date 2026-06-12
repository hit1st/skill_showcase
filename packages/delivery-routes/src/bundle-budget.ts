export const HOME_ROUTE_FIRST_LOAD_JS_BUDGET_KB = 150;

const HOME_ROUTE_LINE = /^[┌├] ○ \/ /;

export const parseHomeFirstLoadJsKb = (buildOutput: string): number | null => {
  const line = buildOutput.split("\n").find((row) => HOME_ROUTE_LINE.test(row));

  if (!line) {
    return null;
  }

  const matches = [...line.matchAll(/(\d+(?:\.\d+)?)\s+kB/g)];
  const last = matches.at(-1);

  return last ? Number(last[1]) : null;
};

export const evaluateBundleBudget = (
  firstLoadJsKb: number,
): { readonly ok: boolean; readonly failures: readonly string[] } => {
  if (firstLoadJsKb <= HOME_ROUTE_FIRST_LOAD_JS_BUDGET_KB) {
    return { ok: true, failures: [] };
  }

  return {
    ok: false,
    failures: [
      `First Load JS ${firstLoadJsKb} kB exceeds ${HOME_ROUTE_FIRST_LOAD_JS_BUDGET_KB} kB`,
    ],
  };
};
