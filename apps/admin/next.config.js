/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/lib", "@repo/types"],
};

export default nextConfig;
