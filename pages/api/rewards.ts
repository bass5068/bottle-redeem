import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function RewardAPI(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const rewards = await prisma.reward.findMany();
      return res.status(200).json(rewards);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      return res.status(500).json({ error: "Failed to fetch rewards" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
