import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function GetPointsAPI(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    try{
        const user = await prisma.user.findUnique({
            where: { id: String(userId) },
        });

        if (!user) {
            return res.status(404).json({error: "ไม่พบ user" })
        }

        return res.status(200).json({ points: user.points })
    } catch (error){
        console.error("error fetching points",error)
        return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(405).json({error:"Method not allowed"})
  }
}
