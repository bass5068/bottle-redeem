
// /pages/api/validate-token.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client"; // ปรับให้ตรงกับโปรเจกต์ของคุณ
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ valid: false, error: "Token is required" });
  }

  const record = await prisma.qRToken.findUnique({
    where: { token }
  });

  if (!record) {
    return res.status(404).json({ valid: false, error: "Token not found" });
  }

  if (record.used) {
    return res.status(400).json({ valid: false, error: "Token already used" });
  }

  if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
    return res.status(400).json({ valid: false, error: "Token expired" });
  }

  // ✅ Update token status to used = true
  await prisma.qRToken.update({
    where: { token },
    data: { used: true }
  });

  return res.status(200).json({
    valid: true,
    PETbig: record.PETbig,
    PETsmall: record.PETsmall,
    points: record.points
  });
}
