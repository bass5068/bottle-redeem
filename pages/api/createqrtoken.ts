import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createQRToken() {
  const newToken = await prisma.qRToken.create({
    data: {
      token: generateRandomToken(), // ฟังก์ชันสำหรับสร้าง token
      tokenStatus: 'unused',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Set expiration to 15 min  from now
    },
  });

  console.log('QR Token Created:', newToken);
}

function generateRandomToken(): string {
  return Math.random().toString(36).substring(2, 12); // ตัวอย่าง token 10 ตัวอักษร
}

createQRToken();