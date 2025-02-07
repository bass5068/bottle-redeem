"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { mutate } from "swr";

interface Redemption {
  id: string;
  reward: {
    name: string;
  };
  createdAt: string;
  status: string;
}

export default function UserHistory() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<Redemption[]>([]);

  useEffect(() => {
    if (session?.user.id) {
      fetch(`/api/get-history?userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => setHistory(data))
        .catch((error) => console.error("Failed to fetch history:", error));
    }
  }, [session]);

  const confirmReceived = async (id: string) => {
    try {
      await fetch("/api/redemptions/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redemptionId: id, status: "COMPLETED" }),
      });

      setHistory((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "COMPLETED" } : r))
      );

      mutate(`/api/get-history?userId=${session?.user.id}`);
    } catch (error) {
      console.error("Failed to update redemption status:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">📦 ประวัติการแลกของ</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 shadow-lg bg-white">
          <thead className="bg-green-500 text-white">
            <tr>
              <th className="border px-4 py-2">ของรางวัล</th>
              <th className="border px-4 py-2">วันที่แลก</th>
              <th className="border px-4 py-2">สถานะ</th>
              <th className="border px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((r, index) => (
              <tr
                key={r.id}
                className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
              >
                <td className="border px-4 py-2">{r.reward.name}</td>
                <td className="border px-4 py-2">
                  {new Date(r.createdAt).toLocaleString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td
                  className={`border px-4 py-2 font-semibold ${
                    r.status === "PENDING"
                      ? "text-yellow-500"
                      : r.status === "SHIPPED"
                      ? "text-blue-500"
                      : "text-green-500"
                  }`}
                >
                  {r.status === "PENDING"
                    ? "รอจัดส่ง"
                    : r.status === "SHIPPED"
                    ? "จัดส่งแล้ว"
                    : "ได้รับสินค้าแล้ว"}
                </td>
                <td className="border px-4 py-2 text-center">
                  {r.status === "SHIPPED" && (
                    <button
                      onClick={() => confirmReceived(r.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded shadow hover:bg-green-600"
                    >
                      ✅ ได้รับสินค้าแล้ว
                    </button>
                  )}
                  {r.status === "COMPLETED" && (
                    <span className="text-gray-500">✔️ รับสินค้าแล้ว</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
