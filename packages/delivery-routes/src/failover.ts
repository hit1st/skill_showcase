import { DELIVERY_ROUTES } from "./constants";

export type FailoverStep = {
  readonly route: typeof DELIVERY_ROUTES.originPrimary | typeof DELIVERY_ROUTES.originFallback;
  readonly role: "primary" | "fallback";
};

export const planFailoverRequests = (primaryStatus: number): readonly FailoverStep[] => {
  const primaryStep: FailoverStep = {
    route: DELIVERY_ROUTES.originPrimary,
    role: "primary",
  };

  if (primaryStatus >= 500) {
    return [
      primaryStep,
      { route: DELIVERY_ROUTES.originFallback, role: "fallback" },
    ];
  }

  return [primaryStep];
};
