
// /pages/api/add-points.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function pointADD(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, points, token } = req.body;

  if (!userId || !points || !token) {
    return res.status(400).json({ error: "Missing required fields" });
  }


  try {
    // ตรวจสอบว่า token มีอยู่ในฐานข้อมูลหรือไม่ และยังไม่ถูกใช้
    const tokenRecord = await prisma.qRToken.findUnique({
      where: { token },
    });

    if (!tokenRecord || tokenRecord.used) {
      return res.status(400).json({ error: "Invalid or already used token" });
    }

    // เพิ่มคะแนนให้ user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: points,
        },
      },
    });


    // ✅ อัปเดต token เป็นใช้แล้ว
    await prisma.qRToken.update({
      where: { token },
      data: {
        used: true,
      }
    });

    console.log("API called with", { userId, points, token });
    console.log("Request body:", { userId, points, token });
    console.log("Found token record:", tokenRecord);
    console.log("User before update:", await prisma.user.findUnique({ where: { id: userId } }));



    return res.status(200).json({
      success: true,
      message: "เพิ่มคะแนนเรียบร้อยแล้ว",
      totalPoints: updatedUser.points,
      points,
    });

  } catch (err) {
    console.error("Error in /api/pointADD:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
  
}
