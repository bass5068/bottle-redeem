"use client";

import useSWR, { mutate } from "swr";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Menu, Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

// Fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Navbar() {
  const { data: session, status } = useSession();

  // Validate session before sending the request to SWR
  const userId = session?.user?.id;
  const { data: userData } = useSWR(
    userId ? `/api/users/${userId}/points` : null,
    fetcher
  );

  // Function to refresh user data
  const refreshUserData = () => {
    if (userId) {
      mutate(`/api/users/${userId}/points`);
    }
  };

  return (
    <Disclosure as="nav" className="bg-green-500 text-white">
      {({ open }) => (
        <>
          {/* Desktop Header */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link href="/" className="text-2xl font-bold">
                  BottleCoins
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex space-x-4">
                <Link href="/" className="hover:underline">
                  Home
                </Link>
                <Link href="/rewards" className="hover:underline">
                  Rewards
                </Link>
                <Link href="/history" className="hover:underline">
                  Redemption History
                </Link>
              </div>

              {/* User Info */}
              <div className="hidden md:flex items-center space-x-4">
                {status === "loading" ? (
                  <p className="text-sm">Loading...</p>
                ) : status === "authenticated" ? (
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center space-x-2 bg-white text-green-600 px-3 py-1 rounded cursor-pointer">
                      <span className="font-medium">
                        {userData?.name ?? session.user.name}
                      </span>
                      <span className="bg-yellow-400 text-white px-4 py-1 rounded-full">
                        {userData?.points ?? session.user.points}
                      </span>
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active
                                ? "bg-green-500 text-white"
                                : "text-gray-900"
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
                              active
                                ? "bg-green-500 text-white"
                                : "text-gray-900"
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
                              active
                                ? "bg-green-500 text-white"
                                : "text-gray-900"
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

              {/* Mobile menu button */}
              <div className="-mr-2 flex md:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-green-600">
                  {open ? (
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <Disclosure.Panel className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600"
              >
                Home
              </Link>
              <Link
                href="/rewards"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600"
              >
                Rewards
              </Link>
              <Link
                href="/history"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600"
              >
                Redemption History
              </Link>
            </div>

            {status === "authenticated" ? (
              <div className="border-t-2 border-gray-100 pt-4 pb-3">
                <div className="px-5">
                  <div className="text-xl font-bold text-white">
                    {userData?.name ?? session.user.name}
                  </div>
                  <div className="text-sm font-medium text-yellow-400">
                    {userData?.points ?? session.user.points} Points
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <button
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600"
                    onClick={refreshUserData}
                  >
                    Refresh
                  </button>
                  <Link
                    href="/account"
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600"
                  >
                    Account
                  </Link>
                  <button
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600"
                    onClick={() => signOut()}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 text-center">
                <button
                  onClick={() => signIn("google")}
                  className="p-2 bg-blue-500 text-white rounded"
                >
                  Sign in with Google
                </button>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
