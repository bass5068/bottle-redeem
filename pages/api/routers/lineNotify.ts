// pages/api/routers/lineNotify.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const LINE_CHANNEL_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
const USER_ID = process.env.LINE_USER_ID!; // คนที่ต้องการส่งถึง

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const msg = req.query.msg || 'ถังเก็บขวดเต็มแล้วครับ';

  try {
    await axios.post(
      'https://api.line.me/v2/bot/message/push',
      {
        to: USER_ID,
        messages: [{ type: 'text', text: msg }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CHANNEL_TOKEN}`,
        }
      }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}
