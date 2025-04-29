import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";


export default async function RedeemAPI(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === "POST") {
        const { userId, rewardId} =req.body

        if (!userId || !rewardId) {
            return res.status(400).json({ error:"userId and rewardId are required" })
        }

        try{
            //ดึงข้อมูล user and reward
            const reward = await prisma.reward.findUnique({ where: {id :rewardId } });
            const user = await prisma.user.findUnique({ where: {id :userId } });
            
            if(!reward || !user)
                return res.status(404).json({error : "not found"})


            if (user.points < reward.points) {
                return res.status(400).json({ error: "points bor por nah" });
              }
        
            if (reward.stock <= 0) {
                return res.status(400).json({ error: "kong mod leaw!!" });
              }
            
              await prisma.user.update({
                where: {id: userId},
                data: {points: {decrement: reward.points} },
            })
              await prisma.reward.update({
                where: {id: rewardId},
                data: {stock: {decrement: 1 } },
            });
              await prisma.redemption.create({
                data: {
                  userId,
                  rewardId,
                },
            });
            return res.status(200).json({ message: "Reward redeemed successfully" });
        } catch (error) {
            console.error("Error redeeming reward :",error);
            return res.status(500).json({error: "Failed to redeem reward"})
        }
    
    } else {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }   
}