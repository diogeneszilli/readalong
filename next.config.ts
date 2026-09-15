import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No <Image> usage anywhere; this makes explicit that Next's optional
  // sharp/libvips (LGPL) image pipeline is never invoked by this app.
  images: { unoptimized: true },
};

export default nextConfig;
