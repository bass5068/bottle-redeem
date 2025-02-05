"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Menu } from "@headlessui/react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [userPoints, setUserPoints] = useState<number | null>(null);

  // Fetch user data when session is available
  useEffect(() => {
    if (status === "authenticated") {
      console.log("Session ID:", session?.user.id); // ตรวจสอบ session ID
      fetch(`/api/users/${session?.user.id}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => setUserPoints(data.points))
        .catch((error) => console.error("Failed to fetch user data:", error));
    }
  }, [session, status]);

  return (
    <nav className="flex items-center justify-between bg-blue-600 text-white px-4 py-2">
      {/* Logo */}
      <div className="text-lg font-bold">
        <Link href="/">Point Redeem App</Link>
      </div>

      {/* Navigation Links */}
      <ul className="flex space-x-4">
        <li>
          <Link href="/" className="hover:underline">
            Home
          </Link>
        </li>
        <li>
          <Link href="/rewards" className="hover:underline">
            Rewards
          </Link>
        </li>
        <li>
          <Link href="/history" className="hover:underline">
            Redemption History
          </Link>
        </li>
      </ul>

      {/* User Info or Login */}
      {status === "authenticated" ? (
        <div className="relative">
          <Menu>
            <Menu.Button className="flex items-center space-x-2 bg-white text-blue-600 px-3 py-1 rounded cursor-pointer">
              <span>{session.user.name}</span>
              <span className="bg-yellow-400 text-white px-4 py-1 rounded-full">
                {userPoints ?? session.user.points} 
              </span>
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md">
              {/* Account Link */}
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/account"
                    className={`${
                      active ? "bg-blue-500 text-white" : "text-gray-900"
                    } block w-full text-left px-4 py-2`}
                  >
                    Account
                  </Link>
                )}
              </Menu.Item>
              {/* Logout Button */}
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "bg-blue-500 text-white" : "text-gray-900"
                    } block w-full text-left px-4 py-2`}
                    onClick={() => signOut()}
                  >
                    Logout
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      ) : (
        <button
          className="bg-white text-blue-600 px-3 py-1 rounded"
          onClick={() => signIn()}
        >
          Login
        </button>
      )}
    </nav>
  );
}
