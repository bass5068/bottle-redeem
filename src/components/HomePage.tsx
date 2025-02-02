"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function HomePage() {
  
  const { data: session } = useSession();
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    if (session?.user.id) {
        //ดึงข้อมูล  point ของ user 
        fetch(`/api/get-points?userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => setPoints(data.points))
        .catch((error) => console.error("Failed to fetch points:",error))
    }
  },[session]);
  
  const handleAddPoints = async () => {
    if (session?.user?.id) {
      try {
        const res = await fetch("/api/add-points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session.user.id, points: 10 }),
        });
        const data = await res.json();
        if (res.ok) {
          setPoints(data.user.points); // อัปเดตแต้มใน UI
        } else {
          console.error("Error adding points:", data.error);
        }
      } catch (error) {
        console.error("Failed to add points:", error);
      }
    }
  };



  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200">
      {session ? (
        <>
          <h1 className="text-2xl font-bold text-blue-600">Welcome, {session.user?.name}</h1>
          <p className="text-amber-500">Your Points: {points}</p>
          <button
            onClick={handleAddPoints}
            className="mt-4 p-2 bg-green-500 text-white rounded"
          >
            Add 10 Points
          </button>
          <button
            onClick={() => signOut()}
            className="mt-4 p-2 bg-red-500 text-white rounded"
          >
            Sign Out
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn("google")}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
