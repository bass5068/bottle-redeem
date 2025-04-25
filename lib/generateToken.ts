import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export async function generateToken(expiresInMinutes: number = 30) {
  const token = randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  const created = await prisma.qRToken.create({
    data: {
      token,
      expiresAt,
      used: false,
    },
  });

  return {
    token: created.token,
    expiresAt: created.expiresAt,
  };
}
