/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  output: 'export',
  distDir: 'dist'
};

export default nextConfig;
