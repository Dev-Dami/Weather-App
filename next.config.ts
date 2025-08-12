import type { NextConfig } from "next";
// @ts-expect-error - No type defs for next-pwa
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true
});

const config: NextConfig = {
  reactStrictMode: true,
};

export default withPWA(config);
