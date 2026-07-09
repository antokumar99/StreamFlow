import { create } from "zustand";

export interface AppNotification {
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
    fromName?: string;
    expired?: boolean;
  };
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  toasts: AppNotification[];
  loaded: boolean;

  setNotifications: (
    notifications: AppNotification[]
  ) => void;

  addNotification: (
    notification: AppNotification
  ) => void;

  markRead: (id: string) => void;

  markAllRead: () => void;

  dismissToast: (id: string) => void;

  reset: () => void;
}

const countUnread = (
  notifications: AppNotification[]
) =>
  notifications.filter(
    (notification) => !notification.isRead
  ).length;

export const useNotificationStore =
  create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,
    toasts: [],
    loaded: false,

    setNotifications: (notifications) =>
      set({
        notifications,
        unreadCount: countUnread(
          notifications
        ),
        loaded: true,
      }),

    addNotification: (notification) =>
      set((state) => {
        if (
          state.notifications.some(
            (item) =>
              item._id ===
              notification._id
          )
        ) {
          return state;
        }

        const notifications = [
          notification,
          ...state.notifications,
        ];

        return {
          notifications,
          unreadCount: countUnread(
            notifications
          ),
          toasts: [
            ...state.toasts,
            notification,
          ].slice(-3),
        };
      }),

    markRead: (id) =>
      set((state) => {
        const notifications =
          state.notifications.map(
            (item) =>
              item._id === id
                ? {
                    ...item,
                    isRead: true,
                  }
                : item
          );

        return {
          notifications,
          unreadCount: countUnread(
            notifications
          ),
        };
      }),

    markAllRead: () =>
      set((state) => ({
        notifications:
          state.notifications.map(
            (item) => ({
              ...item,
              isRead: true,
            })
          ),
        unreadCount: 0,
      })),

    dismissToast: (id) =>
      set((state) => ({
        toasts: state.toasts.filter(
          (toast) => toast._id !== id
        ),
      })),

    reset: () =>
      set({
        notifications: [],
        unreadCount: 0,
        toasts: [],
        loaded: false,
      }),
  }));
