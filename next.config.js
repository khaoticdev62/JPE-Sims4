/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        child_process: false,
        crypto: false,
        os: false,
        net: false,
        tls: false,
      };

      // Specifically ignore keytar in the client bundle
      config.externals = [...(config.externals || []), { keytar: 'commonjs keytar' }];
    }
    return config;
  },
  images: {
    unoptimized: true, // Required for Electron file:// protocol
  },
};

module.exports = nextConfig;
