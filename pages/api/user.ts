import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function UserAPI(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
