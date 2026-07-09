"use client";

import {
  useEffect,
} from "react";
import { useRouter } from "next/navigation";

import api from "@/lib/axios";
import { socket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import {
  AppNotification,
  useNotificationStore,
} from "@/store/notificationStore";

const TOAST_DURATION = 6000;

function Toast({
  notification,
}: {
  notification: AppNotification;
}) {
  const router = useRouter();
  const dismissToast =
    useNotificationStore(
      (state) => state.dismissToast
    );
  const markRead =
    useNotificationStore(
      (state) => state.markRead
    );

  useEffect(() => {
    const timer = setTimeout(
      () =>
        dismissToast(notification._id),
      TOAST_DURATION
    );

    return () => clearTimeout(timer);
  }, [notification._id, dismissToast]);

  const isInvite =
    notification.type ===
      "meeting_invite" &&
    Boolean(
      notification.data?.inviteUrl
    ) &&
    !notification.data?.expired;

  const openInvite = async () => {
    dismissToast(notification._id);
    markRead(notification._id);

    try {
      await api.patch(
        `/notifications/${notification._id}/read`
      );
    } catch {
      // keep navigating even if marking read fails
    }

    router.push(
      notification.data!.inviteUrl!
    );
  };

  return (
    <div className="pointer-events-auto w-full max-w-sm rounded-xl border border-gray-700 bg-[#111827]/95 p-4 shadow-2xl backdrop-blur">
      <div className="flex items-start gap-3">
        <div
          className={[
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            isInvite
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-indigo-500/20 text-indigo-400",
          ].join(" ")}
        >
          {isInvite ? (
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
          <p className="truncate text-sm font-semibold text-white">
            {notification.title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm text-gray-400">
            {notification.message}
          </p>

          {isInvite ? (
            <button
              onClick={openInvite}
              className="mt-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              Join now
            </button>
          ) : null}
        </div>

        <button
          onClick={() =>
            dismissToast(
              notification._id
            )
          }
          aria-label="Dismiss notification"
          className="shrink-0 rounded p-1 text-gray-500 hover:bg-white/10 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function NotificationProvider() {
  const user = useAuthStore(
    (state) => state.user
  );
  const toasts = useNotificationStore(
    (state) => state.toasts
  );
  const setNotifications =
    useNotificationStore(
      (state) => state.setNotifications
    );
  const addNotification =
    useNotificationStore(
      (state) => state.addNotification
    );
  const reset = useNotificationStore(
    (state) => state.reset
  );

  useEffect(() => {
    if (!user) {
      reset();
      return;
    }

    let cancelled = false;

    const loadNotifications =
      async () => {
        try {
          const response =
            await api.get(
              "/notifications"
            );

          if (!cancelled) {
            setNotifications(
              response.data
                .notifications || []
            );
          }
        } catch (error) {
          console.error(
            "Failed to load notifications:",
            error
          );
        }
      };

    loadNotifications();

    if (!socket.connected) {
      socket.connect();
    }

    const handleNotification = (
      notification: AppNotification
    ) => {
      addNotification(notification);
    };

    socket.on(
      "notification",
      handleNotification
    );

    return () => {
      cancelled = true;

      socket.off(
        "notification",
        handleNotification
      );
    };
  }, [
    user,
    setNotifications,
    addNotification,
    reset,
  ]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-4 sm:w-96">
      {toasts.map((toast) => (
        <Toast
          key={toast._id}
          notification={toast}
        />
      ))}
    </div>
  );
}
