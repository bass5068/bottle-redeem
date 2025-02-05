"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import Link from "next/link";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface Reward {
  id: number;
  name: string;
  points: number;
  stock: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then((res) => res.json()),
      fetch("/api/rewards").then((res) => res.json()),
    ])
      .then(([usersData, rewardsData]) => {
        setUsers(usersData);
        setRewards(rewardsData);
      })
      .catch((error) => console.error("Failed to fetch data:", error))
      .finally(() => setLoading(false));
  }, []);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session || session.user.role !== "ADMIN") {
    return <p>Access Denied</p>;
  }


  if (loading) {
    return <p>Loading data...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Users Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
        <table className="min-w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Role</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border px-4 py-2">{user.name}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.role}</td>
                <td className="border px-4 py-2">
                  <button className="text-blue-500">Edit</button>
                  <button className="text-red-500 ml-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Rewards Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Manage Rewards</h2>
        <Link href="/admin/rewards" className="hover:underline">
            Add
          </Link>
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
                  <button className="text-red-500 ml-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Redemption Reports Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Redemption Reports</h2>
        <Link href="/admin/reports">
          <span className="text-blue-500 underline">View Redemption Reports</span>
        </Link>
      </section>
    </div>
  );
}
