import { buildAssetPayload, showcaseCacheHeader } from "@showcase/delivery-routes";
import { jsonWithTrace, withApiObservability } from "@/lib/api";
import { withOriginAssetSpan } from "@/lib/request-tracing";
import type { NextRequest } from "next/server";

const handler = async (request: NextRequest) => {
  const payload = buildAssetPayload("dynamic");

  return withOriginAssetSpan(
    { cacheControl: payload.cacheControl, cacheStatus: payload.cacheStatus },
    () =>
      jsonWithTrace(
        request,
        {
          ...payload,
          cacheStatus: payload.cacheStatus,
          note: "Dynamic assets bypass edge cache.",
        },
        {
          headers: {
            "Cache-Control": payload.cacheControl,
            "x-showcase-cache-status": showcaseCacheHeader(payload.cacheStatus),
          },
        },
      ),
  );
};

export const GET = withApiObservability("/api/asset/dynamic", handler);
