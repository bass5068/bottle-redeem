// pages/api/esp-request-token.ts

import { generateToken } from '../../lib/generateToken';
import { NextApiRequest, NextApiResponse } from 'next';

interface TokenResponse {
  token: string;
  expiresAt: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // สร้าง Token ใหม่ มีอายุ 5 นาที
    const generatedToken = await generateToken(5);
    const newToken: TokenResponse = {
      token: generatedToken.token,
      expiresAt: generatedToken.expiresAt.toISOString(),
    };

    // ส่งกลับให้ ESP32
    return res.status(200).json({
      token: newToken.token,
      expiresAt: newToken.expiresAt,
    });
  } catch (error) {
    console.error('Error creating token:', error);
    return res.status(500).json({ message: 'Failed to generate token' });
  }
}
