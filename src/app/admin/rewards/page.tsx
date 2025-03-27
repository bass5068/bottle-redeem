"use client";

import { useEffect, useState } from "react";

interface Reward {
  id: string;
  name: string;
  points: number;
  stock: number;
  image?: string;
}

export default function AdminRewardTable() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [previewImages, setPreviewImages] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [newReward, setNewReward] = useState<Omit<Reward, "id">>({
    name: "",
    points: 0,
    stock: 0,
    image: "",
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    const res = await fetch("/api/rewards");
    const data = await res.json();
    setRewards(data);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, rewardId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("rewardId", rewardId);

    setUploading(true);

    const res = await fetch("/api/upload-reward-image", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setPreviewImages((prev) => ({ ...prev, [rewardId]: data.imageUrl }));
      fetchRewards();
    } else {
      alert("Failed to upload image");
    }

    setUploading(false);
  };

  const handleAddReward = async () => {
    const res = await fetch("/api/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReward),
    });

    if (res.ok) {
      await fetchRewards();
      setNewReward({ name: "", points: 0, stock: 0, image: "" });
    } else {
      alert("Failed to add reward");
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow space-y-10">
      <div>
        <h2 className="text-2xl font-bold mb-4">Add New Reward</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Reward Name"
            className="border rounded p-2"
            value={newReward.name}
            onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Points"
            className="border rounded p-2"
            value={newReward.points}
            onChange={(e) => setNewReward({ ...newReward, points: Number(e.target.value) })}
          />
          <input
            type="number"
            placeholder="Stock"
            className="border rounded p-2"
            value={newReward.stock}
            onChange={(e) => setNewReward({ ...newReward, stock: Number(e.target.value) })}
          />
          <button
            onClick={handleAddReward}
            className="bg-green-500 hover:bg-green-600 text-white rounded p-2 font-semibold"
          >
            Add Reward
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Manage Reward Images</h2>
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Image</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Points</th>
              <th className="border p-2">Stock</th>
              <th className="border p-2">Upload</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((reward) => (
              <tr key={reward.id} className="text-center">
                <td className="border p-2">
                  <img
                    src={previewImages[reward.id] || reward.image || "/placeholder.png"}
                    alt={reward.name}
                    className="w-16 h-16 object-cover mx-auto rounded"
                  />
                </td>
                <td className="border p-2">{reward.name}</td>
                <td className="border p-2">{reward.points}</td>
                <td className="border p-2">{reward.stock}</td>
                <td className="border p-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, reward.id)}
                    disabled={uploading}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
