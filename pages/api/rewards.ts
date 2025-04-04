import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function RewardAPI(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "GET":
      return RewardAPIGet(req, res);
    case "POST":
      return RewardAPIPost(req, res);
    case "PUT":
      return RewardAPIPut(req, res);
    case "DELETE":
      return RewardAPIDelete(req, res);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// **GET /api/rewards**: Fetch all rewards
async function RewardAPIGet(_: NextApiRequest, res: NextApiResponse) {
  try {
    const rewards = await prisma.reward.findMany(); // Fetch all rewards
    return res.status(200).json(rewards);
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return res.status(500).json({ error: "Failed to fetch rewards" });
  }
}

// **POST /api/rewards**: Add a new reward
async function RewardAPIPost(req: NextApiRequest, res: NextApiResponse) {
  const { name, points, stock, description } = req.body;

  if (!name || points == null || stock == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newReward = await prisma.reward.create({
      data: {
        name,
        points: parseInt(points),
        stock: parseInt(stock),
        description: description || null, // Add description field
      },
    });

    return res.status(201).json(newReward);
  } catch (error) {
    console.error("Error creating reward:", error);
    return res.status(500).json({ error: "Failed to create reward" });
  }
}

// **PUT /api/rewards?id={id}**: Update a reward
async function RewardAPIPut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { name, points, stock, description } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const updatedReward = await prisma.reward.update({
      where: { id: id.toString() },
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
}

// **DELETE /api/rewards?id={id}**: Delete a reward
async function RewardAPIDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    await prisma.reward.delete({
      where: { id: id.toString() },
    });

    return res.status(200).json({ message: "Reward deleted successfully" });
  } catch (error) {
    console.error("Error deleting reward:", error);
    return res.status(500).json({ error: "Failed to delete reward" });
  }
}