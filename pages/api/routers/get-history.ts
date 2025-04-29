import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function GetHistoryAPI(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    try {
      const history = await prisma.redemption.findMany({
        where: { userId: String(userId) },
        include: { reward: true },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json(history);
    } catch (error) {
      console.error("Error fetching history:", error);
      return res.status(500).json({ error: "Failed to fetch history" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
