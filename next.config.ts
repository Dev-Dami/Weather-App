import type { NextConfig } from "next";
// @ts-ignore
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true
});

const config: NextConfig = {
  reactStrictMode: true,
};

// @ts-ignore
export default withPWA(config);
