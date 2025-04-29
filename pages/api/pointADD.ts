
// /pages/api/add-points.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, userId } = req.body;

  if (!token || !userId) {
    return res.status(400).json({ error: "Token and userId are required" });
  }

  try {
    const qrToken = await prisma.qRToken.findUnique({ where: { token } });

    if (!qrToken) {
      return res.status(404).json({ error: "Token not found" });
    }

    if (qrToken.used) {
      return res.status(400).json({ error: "Token already used" });
    }

    if (qrToken.expiresAt && new Date(qrToken.expiresAt) < new Date()) {
      return res.status(400).json({ error: "Token expired" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ เพิ่มแต้มให้ผู้ใช้
    await prisma.user.update({
      where: { id: userId },
      data: {
        points: user.points + qrToken.points
      }
    });

    // ✅ อัปเดต token เป็นใช้แล้ว
    await prisma.qRToken.update({
      where: { token },
      data: {
        used: true,
      }
    });

    return res.status(200).json({
      success: true,
      message: "Points added successfully",
      pointsAdded: qrToken.points,
      totalPoints: user.points + qrToken.points
    });

  } catch (err) {
    console.error("Error in /api/pointADD:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
