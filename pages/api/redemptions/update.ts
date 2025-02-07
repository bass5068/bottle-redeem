import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function UpdatedRedemptionAPI(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { redemptionId, status } = req.body;

  if (!redemptionId || !status) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const updatedRedemption = await prisma.redemption.update({
      where: { id: redemptionId },
      data: { status },
    });

    return res.status(200).json(updatedRedemption);
  } catch (error) {
    console.error("Failed to update redemption status:", error);
    return res.status(500).json({ error: "Failed to update redemption status" });
  }
}
