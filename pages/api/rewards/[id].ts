import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }

  if (req.method === "DELETE") {
    try {
      await prisma.reward.delete({ where: { id: String(id) } });
      return res.status(200).json({ message: "Reward deleted successfully" });
    } catch (error) {
      console.error("Error deleting reward:", error);
      return res.status(500).json({ error: "Failed to delete reward" });
    }
  } else if (req.method === "PUT") {
    // Add PUT method to update reward including description
    const { name, points, stock, description } = req.body;

    if (!name || points == null || stock == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const updatedReward = await prisma.reward.update({
        where: { id: String(id) },
        data: {
          name,
          points: parseInt(points),
          stock: parseInt(stock),
          description: description || null, // Add description field
        },
      });

      return res.status(200).json(updatedReward);
    } catch (error) {
      console.error("Error updating reward:", error);
      return res.status(500).json({ error: "Failed to update reward" });
    }
  } else if (req.method === "GET") {
    // Add GET method to retrieve a single reward
    try {
      const reward = await prisma.reward.findUnique({
        where: { id: String(id) },
      });

      if (!reward) {
        return res.status(404).json({ error: "Reward not found" });
      }

      return res.status(200).json(reward);
    } catch (error) {
      console.error("Error fetching reward:", error);
      return res.status(500).json({ error: "Failed to fetch reward" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}