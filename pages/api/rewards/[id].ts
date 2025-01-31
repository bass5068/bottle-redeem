import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      await prisma.reward.delete({ where: { id: String(id) } });
      return res.status(200).json({ message: "Reward deleted successfully" });
    } catch (error) {
      console.error("Error deleting reward:", error);
      return res.status(500).json({ error: "Failed to delete reward" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
