/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@app/api-client', '@app/types', '@app/validation'],
};

module.exports = nextConfig;

