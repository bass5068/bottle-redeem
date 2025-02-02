"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function HistoryPage() {
  const { data: session } = useSession();

  interface HistoryItem {
    id: string;
    reward: {
      name: string;
    };
    createdAt: string;
  }

  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (session?.user.id) {
      fetch(`/api/get-history?userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => setHistory(data))
        .catch((error) => console.error("Failed to fetch history:", error));
    }
  }, [session]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Redemption History</h1>
      <ul>
        {history.map((item) => (
          <li key={item.id} className="mb-2">
            {item.reward.name} - {new Date(item.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
