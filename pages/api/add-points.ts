import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";
import { getSession } from "next-auth/react";

export default async function AddPointsAPI(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ตรวจสอบเฉพาะ POST method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ตรวจสอบ session เพื่อความปลอดภัย
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: "กรุณาเข้าสู่ระบบก่อนใช้งาน" });
    }

    // รับค่า userId และ points จาก request body
    const { userId, points } = req.body;

    // ตรวจสอบความถูกต้องของข้อมูล
    if (!userId) {
      return res.status(400).json({ error: "ไม่พบรหัสผู้ใช้" });
    }

    if (!points || isNaN(points) || points <= 0) {
      return res.status(400).json({ error: "คะแนนต้องเป็นตัวเลขที่มากกว่า 0" });
    }

    // ตรวจสอบว่า userId ตรงกับ session (ป้องกันการเพิ่มคะแนนให้ user อื่น)
    if (session.user?.id !== userId) {
      return res.status(403).json({ error: "ไม่มีสิทธิ์เพิ่มคะแนนให้ผู้ใช้นี้" });
    }

    // ค้นหาผู้ใช้ก่อนอัปเดต เพื่อตรวจสอบว่ามีอยู่จริง
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, points: true }
    });

    if (!user) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้ในระบบ" });
    }

    // อัปเดทแต้มของผู้ใช้ในฐานข้อมูล
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: points,
        },
      },
      // เลือกเฉพาะข้อมูลที่ต้องการส่งกลับ
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
      },
    });


    // ส่งข้อมูลกลับ
    return res.status(200).json({
      message: `เพิ่มคะแนน ${points} แต้มสำเร็จ คะแนนรวมปัจจุบัน: ${updatedUser.points} แต้ม`,
      user: updatedUser,
    });

  } catch (error) {
    console.error("Error in add-points API:", error);
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตแต้มผู้ใช้" });
  }
}