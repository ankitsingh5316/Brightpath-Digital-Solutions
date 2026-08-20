import type { NextConfig } from "next";

/**
 * CSP tuned for Next.js App Router + optional GA4/GTM.
 * Development must allow eval + local websockets so Fast Refresh and client
 * forms can hydrate. Production stays stricter.
 */
function buildContentSecurityPolicy() {
  const isDev = process.env.NODE_ENV !== "production";
  const gtmId =
    process.env.NEXT_PUBLIC_GTM_ID || process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID;
  const gaId =
    process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "'wasm-unsafe-eval'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
  ];

  if (isDev) {
    scriptSrc.push("'unsafe-eval'");
  }

  const connectSrc = [
    "'self'",
    "https://www.google-analytics.com",
    "https://*.google-analytics.com",
    "https://region1.google-analytics.com",
    "https://www.googletagmanager.com",
    "https://*.googletagmanager.com",
    "https://*.analytics.google.com",
    "https://formsubmit.co",
  ];

  if (gtmId || gaId) {
    connectSrc.push("https://stats.g.doubleclick.net");
  }

  if (isDev) {
    connectSrc.push("ws:", "wss:", "http://localhost:*", "ws://localhost:*");
  }

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-src 'self' https://www.googletagmanager.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ];

  return directives.join("; ");
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: buildContentSecurityPolicy(),
  },
];

if (process.env.NODE_ENV === "production") {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  serverExternalPackages: ["mssql"],
  async redirects() {
    return [
      {
        source: "/terms-and-conditions",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/term-conditions",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/term-condition",
        destination: "/terms",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/api/(.*)",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
