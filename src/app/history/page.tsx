"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function HistoryPage() {
  const { data: session } = useSession();

  interface HistoryItem {
    id: string;
    reward: {
      name: string;
      description: string;
    };
    createdAt: string;
  }

  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (session?.user.id) {
      fetch(`/api/get-history?userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          // จัดเรียงตามวันที่ โดยเรียงจากใหม่ไปเก่า
          const sortedHistory = data.sort(
            (a: HistoryItem, b: HistoryItem) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setHistory(sortedHistory);
        })
        .catch((error) => console.error("Failed to fetch history:", error));
    }
  }, [session]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Redemption History</h1>

      {history.length === 0 ? (
        <div className="text-center text-gray-500">
          <p className="text-xl">ยังไม่มีรายการแลกของรางวัล</p>
          <p>คุณยังไม่ได้ทำการแลกของรางวัล</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">#</th>
                <th className="border px-4 py-2 text-left">Reward Name</th>
                <th className="border px-4 py-2 text-left">Description</th>
                <th className="border px-4 py-2 text-left">Redeemed On</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr
                  key={item.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2 font-medium text-gray-800">
                    {item.reward.name}
                  </td>
                  <td className="border px-4 py-2 text-gray-600">
                    {item.reward.description || "No Description"}
                  </td>
                  <td className="border px-4 py-2 text-gray-600">
                    {new Date(item.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
