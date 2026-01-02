/** @type {import('next').NextConfig} */
const nextConfig = {
  // Uncomment these lines for GitHub Pages deployment (static export)
  // output: 'export',
  // basePath: process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}` : '',
  // trailingSlash: true,
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
    // Uncomment for static export
    // unoptimized: true,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
