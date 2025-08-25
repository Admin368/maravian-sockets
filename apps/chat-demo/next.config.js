/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@maravian/maravian-sockets-sdk',
    '@maravian/maravian-sockets-types'
  ],
  experimental: {
    esmExternals: 'loose'
  }
};

module.exports = nextConfig;
