"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import api from "@/lib/axios";
import {
  AppNotification,
  useNotificationStore,
} from "@/store/notificationStore";

const formatTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function NotificationsPage() {
  const router = useRouter();

  const notifications =
    useNotificationStore(
      (state) => state.notifications
    );
  const loaded = useNotificationStore(
    (state) => state.loaded
  );
  const unreadCount =
    useNotificationStore(
      (state) => state.unreadCount
    );
  const markRead =
    useNotificationStore(
      (state) => state.markRead
    );
  const markAllRead =
    useNotificationStore(
      (state) => state.markAllRead
    );

  const openNotification = async (
    notification: AppNotification
  ) => {
    if (!notification.isRead) {
      markRead(notification._id);

      try {
        await api.patch(
          `/notifications/${notification._id}/read`
        );
      } catch (error) {
        console.error(
          "Failed to mark notification read:",
          error
        );
      }
    }

    if (
      notification.type ===
        "meeting_invite" &&
      notification.data?.inviteUrl &&
      !notification.data.expired
    ) {
      router.push(
        notification.data.inviteUrl
      );
    }
  };

  const handleMarkAllRead =
    async () => {
      markAllRead();

      try {
        await api.patch(
          "/notifications/read-all"
        );
      } catch (error) {
        console.error(
          "Failed to mark all notifications read:",
          error
        );
      }
    };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#0b0f19] px-4 py-6 text-white sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                aria-label="Back to dashboard"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-800 bg-[#111827] text-gray-400 hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </Link>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Notifications
                </h1>
                {unreadCount > 0 ? (
                  <p className="text-sm text-gray-400">
                    {unreadCount} unread
                  </p>
                ) : null}
              </div>
            </div>

            {unreadCount > 0 ? (
              <button
                onClick={handleMarkAllRead}
                className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:border-indigo-400 hover:text-white"
              >
                Mark all as read
              </button>
            ) : null}
          </div>

          <div className="mt-6 space-y-3">
            {!loaded ? (
              <p className="text-gray-400">
                Loading notifications...
              </p>
            ) : notifications.length ===
              0 ? (
              <div className="rounded-xl border border-gray-800 bg-[#111827] p-10 text-center">
                <p className="text-gray-400">
                  No notifications yet.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Meeting invites and new
                  messages will show up
                  here.
                </p>
              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <button
                    key={notification._id}
                    onClick={() =>
                      openNotification(
                        notification
                      )
                    }
                    className={[
                      "w-full rounded-xl border p-4 text-left transition",
                      notification.isRead
                        ? "border-gray-800 bg-[#111827] hover:border-gray-700"
                        : "border-indigo-500/60 bg-indigo-500/10 hover:border-indigo-400",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={[
                          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                          notification.type ===
                          "meeting_invite"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-indigo-500/20 text-indigo-400",
                        ].join(" ")}
                      >
                        {notification.type ===
                        "meeting_invite" ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 7l-7 5 7 5V7z" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="truncate font-semibold">
                            {
                              notification.title
                            }
                          </h2>

                          {!notification.isRead ? (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                          ) : null}
                        </div>

                        <p className="mt-1 text-sm text-gray-300">
                          {
                            notification.message
                          }
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <p className="text-xs text-gray-500">
                            {formatTime(
                              notification.createdAt
                            )}
                          </p>

                          {notification.type ===
                          "meeting_invite" ? (
                            notification
                              .data
                              ?.expired ? (
                              <span className="rounded-lg bg-gray-800 px-3 py-1 text-xs text-gray-400">
                                Ended
                              </span>
                            ) : (
                              <span className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold">
                                Join
                              </span>
                            )
                          ) : null}
                        </div>
                      </div>
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
