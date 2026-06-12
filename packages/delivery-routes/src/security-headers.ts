export type SecurityHeaderMap = Readonly<Record<string, string>>;

export const buildSecurityHeaders = (): SecurityHeaderMap => ({
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' http://127.0.0.1:4318 http://localhost:* https://*.workers.dev",
    "img-src 'self' data:",
    "frame-ancestors 'none'",
  ].join("; "),
});
