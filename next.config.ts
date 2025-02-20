/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'your-image-domain.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // เพิ่มขนาดเป็น 10MB หรือปรับตามที่ต้องการ
    },
  },
};

module.exports = nextConfig;
