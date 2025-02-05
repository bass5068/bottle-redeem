import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const history = await prisma.redemption.findMany({
        include: {
          user: {
            select: { name: true, email: true },
          },
          reward: {
            select: { name: true, description: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.status(200).json(history);
    } catch (error) {
      console.error("Failed to fetch admin redemption history:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
