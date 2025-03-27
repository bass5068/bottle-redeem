"use client";

import useSWR, { mutate } from "swr";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Menu } from "@headlessui/react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Navbar() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const { data: userData } = useSWR(
    userId ? `/api/users/${userId}/points` : null,
    fetcher
  );

  const refreshUserData = () => {
    if (userId) {
      mutate(`/api/users/${userId}/points`);
    }
  };

  const renderLinks = () => (
    <>
      <Link href="/" className="block px-3 py-2 rounded-md text-black font-medium hover:bg-green-600 hover:text-white">
        Home
      </Link>
      <Link href="/rewards" className="block px-3 py-2 rounded-md text-black font-medium hover:bg-green-600 hover:text-white">
        Rewards
      </Link>
      <Link href="/history" className="block px-3 py-2 rounded-md text-black font-medium hover:bg-green-600 hover:text-white">
        Redemption History
      </Link>
    </>
  );

  return (
    <nav className="bg-green-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            BottleCoins
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-4">{renderLinks()}</div>

          {/* User Info Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {status === "loading" ? (
              <p className="text-sm">Loading...</p>
            ) : status === "authenticated" ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 bg-white text-green-600 px-3 py-1 rounded cursor-pointer">
                  <img
                    src={session.user.image ?? "/default-avatar.png"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-medium">
                    {userData?.name ?? session.user.name}
                  </span>
                  <span className="bg-yellow-400 text-white px-3 py-1 rounded-full">
                    {userData?.points ?? 0}
                  </span>
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-green-500 text-white" : "text-gray-900"
                        } block w-full text-left px-4 py-2`}
                        onClick={refreshUserData}
                      >
                        Refresh
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/account"
                        className={`${
                          active ? "bg-green-500 text-white" : "text-gray-900"
                        } block w-full text-left px-4 py-2`}
                      >
                        Account
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-green-500 text-white" : "text-gray-900"
                        } block w-full text-left px-4 py-2`}
                        onClick={() => signOut()}
                      >
                        Logout
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="p-2 bg-white text-green-600 px-4 py-2 rounded cursor-pointer"
              >
                Sign in
              </button>
            )}
          </div>

          {/* Mobile User Dropdown */}
          <div className="md:hidden">
            {status === "authenticated" ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 bg-white text-green-600 px-3 py-1 rounded cursor-pointer">
                  <img
                    src={session.user.image ?? "/default-avatar.png"}
                    alt="User Icon"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <span className="text-yellow-300 font-semibold text-sm">
                    {userData?.points ?? 0}
                  </span>
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-50">
                  <div className="px-2 py-3 border-b">
                    <div className="text-base font-medium text-gray-900">
                      {userData?.name ?? session.user.name}
                    </div>
                    <div className="text-sm font-medium text-yellow-500">
                      {userData?.points ?? 0} Points
                    </div>
                  </div>
                  <div className="py-1">
                    {renderLinks()}
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-500 hover:text-white"
                      onClick={refreshUserData}
                    >
                      Refresh
                    </button>
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-500 hover:text-white"
                    >
                      Account
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-500 hover:text-white"
                      onClick={() => signOut()}
                    >
                      Logout
                    </button>
                  </div>
                </Menu.Items>
              </Menu>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="p-2 bg-white text-green-600 px-4 py-2 rounded cursor-pointer"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
