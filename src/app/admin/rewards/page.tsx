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
  const [newReward, setNewReward] = useState<Reward>({
    id: 0,
    name: "",
    points: 0,
    stock: 0,
  });
  const [isEditing, setIsEditing] = useState(false); // Track edit state

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

  const addOrEditReward = () => {
    const url = isEditing ? `/api/rewards?id=${newReward.id}` : "/api/rewards";
    const method = isEditing ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReward),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(isEditing ? "Failed to edit reward" : "Failed to add reward");
        }
        return res.json();
      })
      .then((data) => {
        if (isEditing) {
          // Update the existing reward
          setRewards((prev) =>
            prev.map((reward) => (reward.id === data.id ? data : reward))
          );
        } else {
          // Add new reward
          setRewards((prev) => [...prev, data]);
        }
        setNewReward({ id: 0, name: "", points: 0, stock: 0 });
        setIsEditing(false);
      })
      .catch((error) => console.error(error));
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

  const startEdit = (reward: Reward) => {
    setNewReward(reward);
    setIsEditing(true);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Manage Rewards</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Points</th>
              <th className="border px-4 py-2 text-left">Stock</th>
              <th className="border px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((reward) => (
              <tr key={reward.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{reward.name}</td>
                <td className="border px-4 py-2">{reward.points}</td>
                <td className="border px-4 py-2">{reward.stock}</td>
                <td className="border px-4 py-2 text-center">
                  <button
                    className="px-2 py-1 text-blue-500"
                    onClick={() => startEdit(reward)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 text-red-500"
                    onClick={() => deleteReward(reward.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">{isEditing ? "Edit Reward" : "Add New Reward"}</h2>
        <div className="flex flex-col space-y-4">
        <p className="text-black pl-2">Name</p>
          <input
            type="text"
            placeholder="Reward Name"
            value={newReward.name}
            onChange={(e) =>
              setNewReward({ ...newReward, name: e.target.value })
            }
            className="border px-4 py-2 rounded"
          />
          <p className="text-black pl-2">Price</p>
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
          <p className="text-black pl-2 ">Stock</p>
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
            onClick={addOrEditReward}
          >
            {isEditing ? "Update Reward" : "Add Reward"}
          </button>
        </div>
      </div>
    </div>
  );
}
