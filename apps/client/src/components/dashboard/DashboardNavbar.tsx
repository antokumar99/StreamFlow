"use client";

import {
  useRouter,
} from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

export default function DashboardNavbar() {
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
      {/* RIGHT SECTION */}
      <div className="flex items-center gap-5"> </div>

      <div className="flex items-center gap-5">
        {!user ? (
          <>
    
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
              onClick={() => router.push("/notifications")}
              className="glass px-4 py-2 rounded-xl"
            >
              Notification
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