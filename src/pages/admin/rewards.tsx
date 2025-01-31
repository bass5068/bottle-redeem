import { useState, useEffect } from "react";

export default function ManageRewards() {
  interface Reward {
    id: number;
    name: string;
    points: number;
    stock: number;
  }

  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    fetch("/api/rewards")
      .then((res) => res.json())
      .then((data) => setRewards(data))
      .catch((error) => console.error("Failed to fetch rewards:", error));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Rewards</h1>
      <table className="min-w-full table-auto">
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
                <button className="text-blue-500">Edit</button>
                <button className="text-red-500 ml-2">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
