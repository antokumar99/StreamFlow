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
        href="/home"
        className="text-2xl font-bold"
      >
<div className="flex items-center gap-3">
  <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-indigo-600 via-cyan-600 to-indigo-600 shadow-lg">
    <span className="text-white font-bold text-lg">S</span>

    <div className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
  </div>

  <div>
    <h1 className="text-2xl font-extrabold tracking-tight">
      <span className="bg-linear-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
        StreamFlow
      </span>
    </h1>
  </div>
</div>
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
              onClick={() => router.push("/dashboard")}
              className="glass px-4 py-2 rounded-xl"
            >
              Dashboard
            </button>

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