// /../pages/api/routers/add-points.ts

import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma"; // ปรับให้ตรงกับโปรเจกต์ของคุณ


export default async function AddPointsAPI(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { userId, points } = req.body;
    console.log("API เรียกมาพร้อม:", req.body);


    if (!userId || !points) {
      return res.status(400).json({ error: "จำเป็นต้องมีรหัสผู้ใช้และคะแนน " });
    }

    try {
      //อัปเดทแต้มข้องผู้ใช้ในฐานข้อมูล
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: points,
          },
        },
      });
      
      return res
        .status(200)
        .json({ success: true, message: "อัปเดท Point สำเร็จ", points, user: updatedUser });
    } catch (error) {
      console.error("Error updating points:", error);
      return res
        .status(500)
        .json({ error: "เกิดข้อผิดพลาดในการอัปเดตแต้มผู้ใช้" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
