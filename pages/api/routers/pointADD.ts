// src/pages/api/routers/add-points.ts

import { NextApiRequest, NextApiResponse } from "next";

interface AddPointsRequestBody {
  points: number;
}

const addPoints = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { points }: AddPointsRequestBody = req.body;

    if (points <= 0) {
      return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง" });
    }

    try {
      // ไม่อัปเดตฐานข้อมูล แค่ส่งค่าคะแนนที่เพิ่มขึ้น
      return res.status(200).json({
        message: `เพิ่ม ${points} คะแนนสำเร็จ`,
        points: points, // ส่งค่าคะแนนที่เพิ่มขึ้น
      });
    } catch (error) {
      console.error("Error adding points:", error);
      return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มคะแนน" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
};

export default addPoints;
