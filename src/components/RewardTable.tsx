"use client";

import { useEffect, useState } from "react";

interface Reward {
  id: string;
  name: string;
  points: number;
  stock: number;
}

export default function RewardTable() {
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    fetch("/api/rewards")
      .then((res) => res.json())
      .then((data) => setRewards(data))
      .catch((error) => console.error("Failed to fetch rewards:", error));
  }, []);

  const deleteReward = (id: string) => {
    fetch(`/api/rewards?id=${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => setRewards((prev) => prev.filter((reward) => reward.id !== id)))
      .catch((error) => console.error("Failed to delete reward:", error));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Rewards</h2>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Points</th>
            <th className="border px-4 py-2">Stock</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rewards.map((reward) => (
            <tr key={reward.id}>
              <td className="border px-4 py-2">{reward.name}</td>
              <td className="border px-4 py-2">{reward.points}</td>
              <td className="border px-4 py-2">{reward.stock}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => deleteReward(reward.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
