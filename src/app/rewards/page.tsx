"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { mutate } from "swr";

interface Reward {
  id: number;
  name: string;
  description: string;
  points: number;
  stock: number;
}

export default function RewardsPage() {
  const { data: session } = useSession();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch rewards data
  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const res = await fetch("/api/rewards");
      if (!res.ok) {
        throw new Error("Failed to fetch rewards");
      }
      const data = await res.json();
      setRewards(data);
    } catch (error) {
      console.error("Error fetching rewards:", error);
    }
  };

  const handleRedeem = (reward: Reward) => {
    if ((session?.user?.points ?? 0) < reward.points) {
      setErrorMessage("You do not have enough points to redeem this reward.");
      return;
    }
    setSelectedReward(reward);
    setShowModal(true);
  };

  const confirmRedeem = async () => {
    if (!selectedReward || !session) return;

    try {
      const response = await fetch(`/api/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rewardId: selectedReward.id,
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to redeem reward");
      }

      alert("Redeemed successfully!");

      // Update points in the session
      const updatedPoints = (session.user.points ?? 0) - selectedReward.points;
      session.user.points = updatedPoints; // Update locally (optional)

      // Re-fetch rewards and user points
      await fetchRewards();
      mutate("/api/user/points"); // Refresh user points if SWR is used

      setShowModal(false);
    } catch (error) {
      console.error("Error redeeming reward:", error);
      alert("Failed to redeem reward. Please try again.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-green-600">
        Rewards
      </h1>
      {errorMessage && (
        <p className="text-red-500 font-semibold mb-4 text-center">
          {errorMessage}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <h2 className="text-xl font-bold mb-2 text-gray-800 text-center">
              {reward.name}
            </h2>
            <p className="text-gray-600 mb-4 text-center">
              {reward.description}
            </p>
            <p className="text-yellow-500 font-semibold mb-2 text-center">
              Points:{" "}
              <span className="text-gray-800">{reward.points}</span>
            </p>
            <p
              className={`text-sm font-medium mb-4 text-center ${
                reward.stock > 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              Stock: {reward.stock > 0 ? reward.stock : "Out of Stock"}
            </p>
            <button
              className={`w-full py-2 px-4 rounded font-semibold transition-colors duration-200 ${
                reward.stock > 0 &&
                (session?.user?.points ?? 0) >= reward.points
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-400 text-gray-100 cursor-not-allowed"
              }`}
              onClick={() => handleRedeem(reward)}
              disabled={
                reward.stock === 0 || (session?.user?.points ?? 0) < reward.points
              }
            >
              {reward.stock > 0 && (session?.user?.points ?? 0) >= reward.points
                ? "Redeem"
                : reward.stock === 0
                ? "Out of Stock"
                : "Not Enough Points"}
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 text-center">
              Confirm Redeem
            </h2>
            <p className="text-gray-800 text-lg font-semibold mb-2 text-center">
              {selectedReward.name}
            </p>
            <p className="text-gray-600 mb-4 text-center">
              Points: {selectedReward.points}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={confirmRedeem}
              >
                Redeem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
