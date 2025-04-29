import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function RedemptionsAPI(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const redemptions = await prisma.redemption.findMany({
      include: {
        user: { select: { name: true } },
        reward: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(redemptions);
  } catch (error) {
    console.error("Failed to fetch redemptions:", error);
    return res.status(500).json({ error: "Failed to fetch redemptions" });
  }
}
