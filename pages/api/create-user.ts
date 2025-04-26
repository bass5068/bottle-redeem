// pages/api/create-user.ts
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { email } = req.body;

  try {
    const user = await prisma.user.create({
      data: {
        email,
        role: 'USER',
      },
    });

    res.status(200).json(user);
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
    res.status(500).json({ message: 'Something went wrong' });
  } finally {
    await prisma.$disconnect();
  }
}
