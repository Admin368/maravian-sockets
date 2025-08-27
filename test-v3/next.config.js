/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@maravian/maravian-sockets-sdk',
    '@maravian/maravian-sockets-types'
  ],
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@maravian/maravian-sockets-sdk': require('path').resolve(__dirname, 'packages/sdk/src/index.tsx'),
      };
    }
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs']
    };
    return config;
  }
};

module.exports = nextConfig;
