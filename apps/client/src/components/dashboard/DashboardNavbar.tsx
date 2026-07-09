"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { useNotificationStore } from "@/store/notificationStore";

interface Props {
  onOpenSidebar?: () => void;
}

export default function DashboardNavbar({
  onOpenSidebar,
}: Props) {
  const router = useRouter();

  const { user, logout } = useAuth();
  const unreadCount =
    useNotificationStore(
      (state) => state.unreadCount
    );

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="flex w-full items-center justify-between gap-3 border-b border-gray-800 bg-[#0b0f19] px-4 py-4 text-white sm:px-6">
      {/* LEFT: mobile menu + greeting */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onOpenSidebar}
          aria-label="Open menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-800 bg-[#111827] text-gray-300 hover:text-white md:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <span className="text-lg font-bold text-indigo-500 md:hidden">
          StreamFlow
        </span>
      </div>

      {/* RIGHT */}
      {user ? (
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() =>
              router.push(
                "/notifications"
              )
            }
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-800 bg-[#111827] text-gray-300 hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>

            {unreadCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            ) : null}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold">
              {user.name[0]?.toUpperCase()}
            </div>

            <div className="hidden sm:block">
              <p className="max-w-40 truncate font-semibold">
                {user.name}
              </p>

              <p className="max-w-40 truncate text-xs text-gray-400">
                {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="hidden rounded-xl bg-red-600 px-4 py-2 hover:bg-red-500 sm:block"
          >
            Logout
          </button>
        </div>
      ) : null}
    </nav>
  );
}
