import {
  buildAssetPayload,
  createCacheSessionStore,
  resolveCacheStatus,
  showcaseCacheHeader,
} from "@showcase/delivery-routes";
import { jsonWithTrace, withApiObservability } from "@/lib/api";
import { withOriginAssetSpan } from "@/lib/request-tracing";
import type { NextRequest } from "next/server";

const cacheSession = createCacheSessionStore();

const handler = async (request: NextRequest) => {
  const requestCount = cacheSession.nextRequestCount();
  const payload = buildAssetPayload("cached");
  const cacheStatus = resolveCacheStatus("cached", requestCount);

  return withOriginAssetSpan(
    { cacheControl: payload.cacheControl, cacheStatus },
    () =>
      jsonWithTrace(
        request,
        {
          ...payload,
          cacheStatus,
          requestCount,
          note: "Production uses cf-cache-status on Cloudflare; local uses x-showcase-cache-status.",
        },
        {
          headers: {
            "Cache-Control": payload.cacheControl,
            "x-showcase-cache-status": showcaseCacheHeader(cacheStatus),
          },
        },
      ),
  );
};

export const GET = withApiObservability("/api/asset/cached", handler);
