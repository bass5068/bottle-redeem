"use client";

import { useEffect, useState } from "react";
import { mutate } from "swr";

interface Redemption {
  id: string;
  user: {
    name: string;
  };
  reward: {
    name: string;
    points: number;
  };
  createdAt: string;
  status: string;
}

export default function AdminRedemptions() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/redemptions")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => setRedemptions(data))
      .catch((error) => {
        console.error("Failed to fetch redemptions:", error);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      })
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch("/api/redemptions/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redemptionId: id, status: newStatus }),
      });

      setRedemptions((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );

      mutate("/api/redemptions"); // Refresh data
    } catch (error) {
      console.error("Failed to update redemption status:", error);
    }
  };

  if (loading) return <p className="text-center">⏳ กำลังโหลด...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        📦 การจัดการการแลกของ
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 shadow-lg bg-white">
          <thead className="bg-green-500 text-white">
            <tr className="text-xs md:text-base">
              <th className="border px-2 py-2 md:px-4 md:py-3">ชื่อผู้ใช้</th>
              <th className="border px-2 py-2 md:px-4 md:py-3">ของรางวัล</th>
              <th className="border px-2 py-2 md:px-4 md:py-3">คะแนน</th>
              <th className="border px-2 py-2 md:px-4 md:py-3">วันที่แลก</th>
              <th className="border px-2 py-2 md:px-4 md:py-3">สถานะ</th>
              <th className="border px-2 py-2 md:px-4 md:py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {redemptions.map((r, index) => (
              <tr
                key={r.id}
                className={`text-xs md:text-base ${
                  index % 2 === 0 ? "bg-gray-100" : "bg-white"
                }`}
              >
                <td className="border px-2 py-2 md:px-4 md:py-3">{r.user.name}</td>
                <td className="border px-2 py-2 md:px-4 md:py-3">{r.reward.name}</td>
                <td className="border px-2 py-2 md:px-4 md:py-3">{r.reward.points}</td>
                <td className="border px-2 py-2 md:px-4 md:py-3">
                  {new Date(r.createdAt).toLocaleString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td
                  className={`border px-2 py-2 md:px-4 md:py-3 font-semibold ${
                    r.status === "PENDING"
                      ? "text-yellow-500"
                      : r.status === "SHIPPED"
                      ? "text-blue-500"
                      : "text-green-500"
                  }`}
                >
                  {r.status === "PENDING"
                    ? "กำลังดำเนินการ"
                    : r.status === "SHIPPED"
                    ? "รอรับสินค้า"
                    : "ได้รับสินค้าแล้ว"}
                </td>
                <td className="border px-2 py-2 md:px-4 md:py-3 text-center">
                  {r.status === "PENDING" && (
                    <button
                      onClick={() => updateStatus(r.id, "SHIPPED")}
                      className="bg-blue-400 text-white px-2 py-1 md:px-3 md:py-1.5 rounded shadow hover:bg-blue-600 text-xs md:text-base"
                    >
                      ✅ กดส่ง Order
                    </button>
                  )}
                  {r.status === "SHIPPED" && (
                    <button
                      onClick={() => updateStatus(r.id, "COMPLETED")}
                      className="bg-green-500 text-white px-2 py-1 md:px-3 md:py-1.5 rounded shadow hover:bg-green-600 text-xs md:text-base"
                    >
                      ✅ ยืนยันว่าลูกค้าได้รับแล้ว
                    </button>
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
