/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  output: 'export',
  distDir: 'dist',
  basePath: '/mission-control',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
