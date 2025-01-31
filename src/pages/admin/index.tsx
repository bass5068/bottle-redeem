"use client"

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Reward {
  id: number;
  name: string;
  points: number;
  stock: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    // Fetch users
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Failed to fetch users:", error));

    // Fetch rewards
    fetch("/api/rewards")
      .then((res) => res.json())
      .then((data) => setRewards(data))
      .catch((error) => console.error("Failed to fetch rewards:", error));
  }, []);

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
        <button className="mt-4 p-2 bg-green-500 text-white rounded">Add New Reward</button>
      </section>

      {/* Redemption Reports Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Redemption Reports</h2>
        <Link href="/admin/reports">
          <a className="text-blue-500 underline">View Redemption Reports</a>
        </Link>
      </section>
    </div>
  );
}
