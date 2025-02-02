"use client";

import { useState, useEffect } from "react";

export default function ManageRewards() {
  interface Reward {
    id: number;
    name: string;
    points: number;
    stock: number;
  }

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [newReward, setNewReward] = useState({
    name: "",
    points: 0,
    stock: 0,
  });

  useEffect(() => {
    fetch("/api/rewards")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch rewards");
        }
        return res.json();
      })
      .then((data) => setRewards(data))
      .catch((error) => console.error("Error fetching rewards:", error));
  }, []);

  const addReward = () => {
    fetch("/api/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReward),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to add reward");
        }
        return res.json();
      })
      .then((data) => {
        setRewards((prev) => [...prev, data]);
        setNewReward({ name: "", points: 0, stock: 0 });
      })
      .catch((error) => console.error("Error adding reward:", error));
  };

  const deleteReward = (id: number) => {
    fetch(`/api/rewards?id=${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete reward");
        }
        return res.json();
      })
      .then(() => {
        setRewards((prev) => prev.filter((reward) => reward.id !== id));
      })
      .catch((error) => console.error("Error deleting reward:", error));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Rewards</h1>
      <table className="min-w-full table-auto border-collapse border border-gray-200">
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
                <button
                  className="text-red-500 ml-2"
                  onClick={() => deleteReward(reward.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Add New Reward</h2>
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Reward Name"
            value={newReward.name}
            onChange={(e) =>
              setNewReward({ ...newReward, name: e.target.value })
            }
            className="border px-4 py-2 rounded"
          />
          <input
            type="number"
            placeholder="Points"
            value={newReward.points}
            onChange={(e) =>
              setNewReward({
                ...newReward,
                points: parseInt(e.target.value) || 0,
              })
            }
            className="border px-4 py-2 rounded"
          />
          <input
            type="number"
            placeholder="Stock"
            value={newReward.stock}
            onChange={(e) =>
              setNewReward({
                ...newReward,
                stock: parseInt(e.target.value) || 0,
              })
            }
            className="border px-4 py-2 rounded"
          />
          <button
            className="p-2 bg-green-500 text-white rounded"
            onClick={addReward}
          >
            Add Reward
          </button>
        </div>
      </div>
    </div>
  );
}
