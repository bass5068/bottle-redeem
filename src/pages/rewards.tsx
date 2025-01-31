"use client"

import { useEffect, useState } from "react";

interface Reward {
    id: number;
    name: string;
    description: string;
    points: number;
    stock: number;
}

export default function RewardsPage() {
    const [reward, setReward] = useState<Reward[]>([]) ;

    useEffect(() => {
        fetch("/api/rewards")
        .then((res) => res.json())
        .then((data) => setReward(data))
        .catch((error) => console.error("Failed to fetch rewards:", error));

    },[]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Rewards</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reward.map((reward) =>(
                    <div key={reward.id} className="p-4 border rounded shadow">
                        <h2>{reward.name}</h2>
                        <p>{reward.description}</p>
                        <p>Points Required : {reward.points}</p>
                        <p>Stock : {reward.stock}</p>
                        <button
                            className=""
                            disabled= {reward.stock === 0}
                        >
                            Redeem
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}