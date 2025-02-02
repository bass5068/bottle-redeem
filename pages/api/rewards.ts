import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "GET": {
      try {
        const rewards = await prisma.reward.findMany(); // ดึงข้อมูลทั้งหมด
        res.status(200).json(rewards);
      } catch {
        res.status(500).json({ error: "Failed to fetch rewards" });
      }
      break;
    }

    case "POST": {
      try {
        const { name, points, stock } = req.body; // รับข้อมูลจากคำขอ
        const newReward = await prisma.reward.create({
          data: {
            name,
            points,
            stock,
          },
        });
        res.status(201).json(newReward); // คืนข้อมูลสินค้าใหม่
      } catch {
        res.status(500).json({ error: "Failed to create reward" });
      }
      break;
    }

    case "DELETE": {
      try {
        const { id } = req.query; // รับ `id` จาก Query Parameter
        if (!id) {
          res.status(400).json({ error: "Reward ID is required" });
          return;
        }
        await prisma.reward.delete({
          where: { id: id as string },
        });
        res.status(200).json({ message: "Reward deleted successfully" });
      } catch {
        res.status(500).json({ error: "Failed to delete reward" });
      }
      break;
    }

    default: {
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  }
}
