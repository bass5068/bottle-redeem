"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";

interface Reward {
  id: number;
  name: string;
  description: string;
  image?: string;
  points: number;
  stock: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RewardsPage() {
  const { data: session } = useSession();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const res = await fetch("/api/rewards");
      if (!res.ok) throw new Error("Failed to fetch rewards");
      const data = await res.json();
      setRewards(data);
    } catch (error) {
      console.error("Error fetching rewards:", error);
    }
  };

  const { data: userData, mutate: refreshUserData } = useSWR(
    session?.user?.id ? `/api/users/${session.user.id}/points` : null,
    fetcher
  );

  const handleRedeem = (reward: Reward) => {
    if ((userData?.points ?? 0) < reward.points) {
      setErrorMessage("คุณมีแต้มไม่เพียงพอในการแลกรางวัลนี้");
      return;
    }
    setSelectedReward(reward);
    setShowModal(true);
  };

  const confirmRedeem = async () => {
    if (!selectedReward || !session) return;

    try {
      const response = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rewardId: selectedReward.id,
          userId: session.user.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to redeem reward");

      alert("แลกรางวัลสำเร็จ!");
      await fetchRewards();
      refreshUserData();
      setShowModal(false);
    } catch (error) {
      console.error("Error redeeming reward:", error);
      alert("ไม่สามารถแลกรางวัลได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-green-600">
        🎁 Rewards
      </h1>
      {errorMessage && (
        <p className="text-red-500 font-semibold mb-4 text-center">
          {errorMessage}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">
            ⛔ ยังไม่มีของรางวัลให้แลก
          </div>
        ) : (
          rewards.map((reward) => {
            const canRedeem = reward.stock > 0 && (userData?.points ?? 0) >= reward.points;

            return (
              <div
                key={reward.id}
                className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 overflow-hidden"
              >
                <div className="absolute top-2 left-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                  NEW
                </div>

                {reward.image && (
                  <img
                    src={reward.image}
                    alt={reward.name}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                )}

                <div className="p-4 text-center">
                  <h2 className="text-xl font-bold text-gray-800">{reward.name}</h2>
                  <p className="text-gray-500 text-sm mt-1 mb-2">{reward.description}</p>

                  <div className="text-sm text-gray-700 mb-1">
                    🎯 <span className="font-semibold text-yellow-500">{reward.points.toLocaleString()}</span> Coins
                  </div>
                  <div className={`text-sm font-medium mb-4 ${reward.stock > 0 ? "text-green-500" : "text-red-500"}`}>
                    {reward.stock > 0 ? `สต็อก ${reward.stock} ชิ้น` : "สินค้าหมด"}
                  </div>

                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canRedeem}
                    className={`w-full py-2 px-4 rounded-lg font-bold transition ${
                      canRedeem
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {canRedeem ? "แลกเลย 🚀" : reward.stock === 0 ? "หมดแล้ว" : "แต้มไม่พอ"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-[90%] p-6 relative">
            <h2 className="text-xl font-bold text-green-600 text-center mb-4">
              🎁 ยืนยันการแลกรางวัล
            </h2>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">{selectedReward.name}</p>
              <p className="text-sm text-gray-600 mt-1 mb-4">
                ใช้ <span className="text-yellow-500 font-bold">{selectedReward.points}</span> Coins
              </p>
            </div>

            <div className="flex justify-between gap-4">
              <button
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-md"
                onClick={() => setShowModal(false)}
              >
                ยกเลิก
              </button>
              <button
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-semibold"
                onClick={confirmRedeem}
              >
                แลกเลย 🚀
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
