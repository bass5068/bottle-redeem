import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

// API สำหรับจัดการข้อมูลบัญชี
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "GET":
      return handleGet(req, res);
    case "PUT":
      return handlePut(req, res);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// ดึงข้อมูลบัญชีผู้ใช้
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

// อัปเดตข้อมูลบัญชีผู้ใช้
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { userId, name, image } = req.body;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, image },
    });

    res.status(200).json(updatedUser);
  } catch {
    res.status(500).json({ error: "Failed to update user" });
  }
}
