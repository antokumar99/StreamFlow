"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const router = useRouter();

  const {
    user,
    logout,
  } = useAuth();

  const handleLogout =
    () => {
      logout();

      router.push("/");
    };

  return (
    <nav className="w-full flex items-center justify-between px-8 py-5 border-b border-gray-800 bg-[#0b0f19] text-white">
      {/* LOGO */}

      <Link
        href="/"
        className="text-2xl font-bold"
      >
        StreamFlow
      </Link>

      {/* RIGHT SECTION */}

      <div className="flex items-center gap-5">
        {!user ? (
          <>
            <Link
              href="/login"
              className="hover:text-indigo-400"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="bg-indigo-600 px-5 py-2 rounded-xl"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold">
                {user.name[0]}
              </div>

              <div>
                <p className="font-semibold">
                  {user.name}
                </p>

                <p className="text-xs text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={
                handleLogout
              }
              className="bg-red-600 px-4 py-2 rounded-xl"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}