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
    <div className="p-4 bg-white shadow-xl rounded-xl">
      <h2 className="text-3xl font-bold text-center text-green-600 mb-6">🎁 รายการของรางวัล</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 rounded-md overflow-hidden">
          <thead className="bg-green-100">
            <tr>
              <th className="border px-4 py-3 text-left text-sm font-semibold text-green-800 whitespace-nowrap">
                📦 ชื่อรางวัล
              </th>
              <th className="border px-4 py-3 text-left text-sm font-semibold text-green-800 whitespace-nowrap">
                💰 Coins ที่ใช้แลก
              </th>
              <th className="border px-4 py-3 text-left text-sm font-semibold text-green-800 whitespace-nowrap">
                📦 สินค้าคงเหลือ
              </th>
              <th className="border px-4 py-3 text-left text-sm font-semibold text-green-800 whitespace-nowrap">
                ⚙️ จัดการ
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
                  <td className="border px-4 py-3 text-sm font-medium text-gray-900">
                    🛍️ {reward.name}
                  </td>
                  <td className="border px-4 py-3 text-sm text-yellow-600 font-semibold">
                    {reward.points.toLocaleString()} Coins
                  </td>
                  <td className="border px-4 py-3 text-sm text-green-700 font-semibold">
                    {reward.stock} ชิ้น
                  </td>
                  <td className="border px-4 py-3 text-sm">
                    <button
                      onClick={() => deleteReward(reward.id)}
                      className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition"
                    >
                      ลบสินค้า
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="text-center border px-4 py-6 text-gray-500 text-base"
                >
                  ⛔ ยังไม่มีรางวัลในระบบ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}