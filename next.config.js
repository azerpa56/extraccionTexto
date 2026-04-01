/** @type {import('next').NextConfig} */
const nextConfig = {
  // Necesario para que Tesseract.js funcione en el cliente
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
