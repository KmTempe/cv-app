import type { NextConfig } from "next";
import pkg from "./package.json" with { type: "json" };

const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' ${isDev ? "'unsafe-eval' 'unsafe-inline'" : ""} https://*.vercel.live`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.vercel.live https://*.vercel.app",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://*.vercel.live",
      "connect-src 'self' https://*.vercel.live https://*.vercel.app wss://*.vercel.live",
      "frame-src https://*.vercel.live",
      "object-src 'none'",
    ]
      .filter(Boolean)
      .join("; "),
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  compress: true,
  env: {
    APP_VERSION: pkg.version,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
