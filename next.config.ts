/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // สำหรับรูปจาก Google
      'res.cloudinary.com', // ถ้าใช้ Cloudinary
      // เพิ่ม domain อื่นๆ ตามที่ใช้
    ],
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Large-Allocation',
            value: 'true',
          },
        ],
      },
    ]
  },
};

module.exports = nextConfig;