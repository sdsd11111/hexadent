/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        formats: ['image/webp'],
    },
    transpilePackages: ['@react-pdf/renderer'],
    webpack: (config) => {
        config.resolve.alias.canvas = false;
        return config;
    },
}

module.exports = nextConfig
