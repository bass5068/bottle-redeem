import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

// Define the Status type
type Status = "PENDING" | "SHIPPED" | "COMPLETED";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // เฉพาะ PUT method เท่านั้น
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    // ตรวจสอบการล็อกอิน
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { redemptionId, status } = req.body;

    // ตรวจสอบว่ามีข้อมูลครบถ้วน
    if (!redemptionId || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ตรวจสอบว่า status ถูกต้อง
    if (!["PENDING", "SHIPPED", "COMPLETED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // หา redemption ที่ต้องการอัพเดต
    const redemption = await prisma.redemption.findUnique({
      where: { id: String(redemptionId) },
      include: { user: true }
    });

    if (!redemption) {
      return res.status(404).json({ message: "Redemption not found" });
    }

    // ตรวจสอบสิทธิ์:
    // - แอดมินสามารถอัพเดตสถานะได้ทุกรายการ
    // - ผู้ใช้ทั่วไปสามารถอัพเดตได้เฉพาะรายการของตัวเอง และเฉพาะจาก SHIPPED เป็น COMPLETED เท่านั้น
    if (session.user.role !== "ADMIN") {
      // ตรวจสอบว่าเป็นเจ้าของรายการหรือไม่
      if (redemption.user.id !== session.user.id) {
        return res.status(403).json({ message: "Forbidden: Not your redemption" });
      }

      // ผู้ใช้ทั่วไปสามารถอัพเดตได้เฉพาะจาก SHIPPED เป็น COMPLETED เท่านั้น
      if (redemption.status !== "SHIPPED" as Status || status !== "COMPLETED") {
        return res.status(403).json({ message: "Forbidden: You can only confirm receipt of shipped items" });
      }
    }

    // อัพเดตสถานะ
    const updatedRedemption = await prisma.redemption.update({
      where: { id: String(redemptionId) },
      data: { status },
    });

    return res.status(200).json(updatedRedemption);
  } catch (error) {
    console.error("Error updating redemption status:", error);
    return res.status(500).json({ message: "Failed to update redemption status" });
  }
}