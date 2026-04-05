/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Redirect / to app if needed, or keep as marketing site
  async rewrites() {
    return [
      {
        source: '/app/:path*',
        destination: 'https://app.guestworker.app/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

