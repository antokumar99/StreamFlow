"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/axios";
import { socket } from "@/lib/socket";

interface NotificationItem {
  _id: string;
  isRead: boolean;
}

export default function DashboardNavbar() {
  const router = useRouter();

  const {
    user,
    logout,
  } = useAuth();
  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const handleLogout =
    () => {
      logout();

      router.push("/");
    };

  useEffect(() => {
    if (!user) return;

    const loadNotifications =
      async () => {
        const response =
          await api.get(
            "/notifications"
          );
        const notifications =
          response.data
            .notifications || [];

        setUnreadCount(
          notifications.filter(
            (
              notification: NotificationItem
            ) =>
              !notification.isRead
          ).length
        );
      };

    loadNotifications();

    if (!socket.connected) {
      socket.connect();
    }

    const handleNotification = () => {
      setUnreadCount(
        (current) => current + 1
      );
    };

    socket.on(
      "notification",
      handleNotification
    );

    return () => {
      socket.off(
        "notification",
        handleNotification
      );
    };
  }, [user]);

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
              className="glass relative px-4 py-2 rounded-xl"
            >
              Notification
              {unreadCount > 0 ? (
                <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs">
                  {unreadCount}
                </span>
              ) : null}
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
