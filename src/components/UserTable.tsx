"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Failed to fetch users:", error));
  }, []);

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
        Users
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="border px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="border px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Role
              </th>
              <th className="border px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Points
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr
                  key={user.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border px-4 py-2 text-sm font-medium text-gray-800">
                    {user.name}
                  </td>
                  <td className="border px-4 py-2 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="border px-4 py-2 text-sm text-gray-600">
                    {user.role}
                  </td>
                  <td className="border px-4 py-2 text-sm text-gray-600">
                    {user.points}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="text-center border px-4 py-4 text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
