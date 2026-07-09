"use client";

import { useRouter } from "next/navigation";
import {
  FormEvent,
  useRef,
  useState,
} from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardStats from "@/components/dashboard/DashboardStats";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentMeetings from "@/components/dashboard/RecentMeetings";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/axios";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] =
    useState(false);
  const [roomId, setRoomId] =
    useState("");
  const [joinError, setJoinError] =
    useState("");
  const joinInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const handleCreateMeeting = async (
    callType: "video" | "audio" = "video"
  ) => {
    if (loading) return;

    try {
      setLoading(true);

      const response = await api.post(
        "/meetings",
        {
          callType,
        }
      );
      const newRoomId =
        response.data.meeting.roomId;

      router.push(
        `/meeting/${newRoomId}${
          callType === "audio"
            ? "?type=audio"
            : ""
        }`
      );
    } catch (error) {
      console.error(
        "Error creating meeting:",
        error
      );
      setLoading(false);
    }
  };

  const joinMeeting = (
    event?: FormEvent
  ) => {
    event?.preventDefault();

    const value = roomId.trim();

    if (!value) {
      setJoinError(
        "Enter a room ID or paste an invite link."
      );
      joinInputRef.current?.focus();
      return;
    }

    setJoinError("");

    const roomFromLink = value.match(
      /\/meeting\/([^/?#]+)/
    )?.[1];
    const audioSuffix =
      value.includes("type=audio")
        ? "?type=audio"
        : "";

    router.push(
      `/meeting/${roomFromLink || value}${audioSuffix}`
    );
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              {user
                ? `Welcome back, ${user.name.split(" ")[0]}`
                : "Dashboard"}
            </h1>

            <p className="mt-2 text-gray-400">
              Start a meeting or join one
              with a room ID.
            </p>
          </div>

          <div className="w-full lg:max-w-xl">
            <form
              onSubmit={joinMeeting}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <button
                type="button"
                onClick={() =>
                  handleCreateMeeting(
                    "video"
                  )
                }
                disabled={loading}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500 disabled:opacity-60"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                {loading
                  ? "Creating..."
                  : "New Meeting"}
              </button>

              <div className="flex min-w-0 flex-1 gap-2">
                <input
                  type="text"
                  placeholder="Room ID or invite link"
                  value={roomId}
                  ref={joinInputRef}
                  onChange={(e) => {
                    setRoomId(
                      e.target.value
                    );
                    if (joinError) {
                      setJoinError("");
                    }
                  }}
                  className="min-w-0 flex-1 rounded-xl"
                />

                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-emerald-600 px-5 py-3 font-semibold transition hover:bg-emerald-500"
                >
                  Join
                </button>
              </div>
            </form>

            {joinError ? (
              <p className="mt-2 text-sm text-red-400">
                {joinError}
              </p>
            ) : null}
          </div>
        </div>

        {/* Stats */}
        <DashboardStats />

        {/* Quick Actions */}
        <QuickActions
          onCreateVideo={() =>
            handleCreateMeeting("video")
          }
          onCreateAudio={() =>
            handleCreateMeeting("audio")
          }
          onFocusJoin={() =>
            joinInputRef.current?.focus()
          }
        />

        {/* Meetings */}
        <RecentMeetings />
      </div>
    </ProtectedRoute>
  );
}
