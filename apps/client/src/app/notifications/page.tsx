"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import api from "@/lib/axios";
import { socket } from "@/lib/socket";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: "message" | "meeting_invite";
  isRead: boolean;
  createdAt: string;
  data?: {
    inviteUrl?: string;
    roomId?: string;
    callType?: "video" | "audio";
  };
}

const formatTime = (value: string) =>
  new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));

export default function NotificationsPage() {
  const router = useRouter();
  const [
    notifications,
    setNotifications,
  ] = useState<NotificationItem[]>([]);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadNotifications =
      async () => {
        try {
          const response =
            await api.get(
              "/notifications"
            );

          setNotifications(
            response.data
              .notifications || []
          );
        } finally {
          setLoading(false);
        }
      };

    loadNotifications();
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleNotification = (
      notification: NotificationItem
    ) => {
      setNotifications(
        (current) => [
          notification,
          ...current,
        ]
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
  }, []);

  const markRead = async (
    notification: NotificationItem
  ) => {
    if (!notification.isRead) {
      await api.patch(
        `/notifications/${notification._id}/read`
      );

      setNotifications(
        (current) =>
          current.map((item) =>
            item._id ===
            notification._id
              ? {
                  ...item,
                  isRead: true,
                }
              : item
          )
      );
    }

    if (
      notification.type ===
        "meeting_invite" &&
      notification.data?.inviteUrl
    ) {
      router.push(
        notification.data.inviteUrl
      );
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#0b0f19] p-6 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold">
            Notifications
          </h1>

          <div className="mt-6 space-y-3">
            {loading ? (
              <p className="text-gray-400">
                Loading notifications...
              </p>
            ) : notifications.length ===
              0 ? (
              <p className="text-gray-400">
                No notifications yet.
              </p>
            ) : (
              notifications.map(
                (notification) => (
                  <button
                    key={
                      notification._id
                    }
                    onClick={() =>
                      markRead(
                        notification
                      )
                    }
                    className={[
                      "w-full rounded-lg border p-4 text-left transition",
                      notification.isRead
                        ? "border-gray-800 bg-[#111827]"
                        : "border-indigo-400 bg-indigo-500/15",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-semibold">
                          {
                            notification.title
                          }
                        </h2>
                        <p className="mt-1 text-sm text-gray-300">
                          {
                            notification.message
                          }
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          {formatTime(
                            notification.createdAt
                          )}
                        </p>
                      </div>

                      {notification.type ===
                      "meeting_invite" ? (
                        <span className="shrink-0 rounded bg-emerald-600 px-3 py-1 text-xs">
                          Join
                        </span>
                      ) : null}
                    </div>
                  </button>
                )
              )
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
