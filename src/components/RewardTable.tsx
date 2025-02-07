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
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-green-600">Rewards</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="border px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Points
              </th>
              <th className="border px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Stock
              </th>
              <th className="border px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rewards.length > 0 ? (
              rewards.map((reward, index) => (
                <tr
                  key={reward.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border px-4 py-2 text-sm font-medium text-gray-800">
                    {reward.name}
                  </td>
                  <td className="border px-4 py-2 text-sm text-gray-600">
                    {reward.points}
                  </td>
                  <td className="border px-4 py-2 text-sm text-gray-600">
                    {reward.stock}
                  </td>
                  <td className="border px-4 py-2 text-sm text-gray-600">
                    <button
                      onClick={() => deleteReward(reward.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="text-center border px-4 py-4 text-gray-500"
                >
                  No rewards available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
