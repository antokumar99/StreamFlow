"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import api from "@/lib/axios";

interface MeetingStats {
  totalMeetings: number;
  totalHours: number;
  uniquePeople: number;
  audioCalls: number;
  videoCalls: number;
  mostCalled?: {
    name: string;
    calls: number;
  } | null;
}

export default function HomePage() {
  const router = useRouter();
  const [meetingLink, setMeetingLink] =
    useState("");
  const [loadingType, setLoadingType] =
    useState<
      "video" | "audio" | null
    >(null);
  const [stats, setStats] =
    useState<MeetingStats | null>(
      null
    );

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response =
          await api.get(
            "/meetings/stats"
          );
        setStats(
          response.data.stats
        );
      } catch (error) {
        console.error(
          "Failed to load home stats:",
          error
        );
      }
    };

    loadStats();
  }, []);

  const createCall = async (
    callType: "video" | "audio"
  ) => {
    setLoadingType(callType);

    try {
      const response =
        await api.post(
          "/meetings",
          {
            callType,
          }
        );
      const roomId =
        response.data.meeting.roomId;

      router.push(
        `/meeting/${roomId}${
          callType === "audio"
            ? "?type=audio"
            : ""
        }`
      );
    } finally {
      setLoadingType(null);
    }
  };

  const joinCall = () => {
    const value =
      meetingLink.trim();

    if (!value) return;

    const roomFromLink =
      value.match(
        /\/meeting\/([^/?#]+)/
      )?.[1];
    const queryFromLink =
      value.includes(
        "type=audio"
      )
        ? "?type=audio"
        : "";

    router.push(
      `/meeting/${
        roomFromLink || value
      }${queryFromLink}`
    );
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#0b0f19] text-white">
        <section className="px-6 py-10 lg:px-12">
          <div className="mx-auto max-w-7xl space-y-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                  StreamFlow
                </h1>

                <p className="mt-4 max-w-2xl text-lg text-gray-400">
                  Start a room, join from an invite link, or switch into an audio-first call.
                </p>
              </div>

              <div className="rounded-lg border border-gray-800 bg-[#111827] p-4">
                <label className="text-sm text-gray-400">
                  Join with room ID or meeting link
                </label>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={meetingLink}
                    onChange={(event) =>
                      setMeetingLink(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        joinCall();
                      }
                    }}
                    placeholder="Paste invite link"
                    className="min-w-0 flex-1 rounded border border-gray-700 bg-[#0b0f19] px-3 py-3 outline-none focus:border-indigo-400"
                  />

                  <button
                    onClick={joinCall}
                    className="rounded bg-emerald-600 px-5 py-3 font-medium hover:bg-emerald-700"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <button
                onClick={() =>
                  createCall("video")
                }
                className="rounded-lg border border-gray-800 bg-[#111827] p-6 text-left transition hover:border-indigo-400"
              >
                <p className="text-sm text-gray-400">
                  Video
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Create video call
                </h2>
                <p className="mt-3 text-gray-400">
                  Opens a camera-on meeting room with invite sharing.
                </p>
                <span className="mt-5 inline-block rounded bg-indigo-600 px-4 py-2 text-sm">
                  {loadingType ===
                  "video"
                    ? "Creating..."
                    : "Start"}
                </span>
              </button>

              <button
                onClick={() =>
                  createCall("audio")
                }
                className="rounded-lg border border-gray-800 bg-[#111827] p-6 text-left transition hover:border-cyan-400"
              >
                <p className="text-sm text-gray-400">
                  Audio
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Create audio call
                </h2>
                <p className="mt-3 text-gray-400">
                  Starts voice-first, with video available when needed.
                </p>
                <span className="mt-5 inline-block rounded bg-cyan-600 px-4 py-2 text-sm">
                  {loadingType ===
                  "audio"
                    ? "Creating..."
                    : "Start"}
                </span>
              </button>

              <button
                onClick={() =>
                  router.push("/chat")
                }
                className="rounded-lg border border-gray-800 bg-[#111827] p-6 text-left transition hover:border-amber-400"
              >
                <p className="text-sm text-gray-400">
                  Chat
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Open messages
                </h2>
                <p className="mt-3 text-gray-400">
                  Continue direct and group conversations.
                </p>
                <span className="mt-5 inline-block rounded bg-amber-600 px-4 py-2 text-sm">
                  Open
                </span>
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-gray-800 bg-[#111827] p-5">
                <p className="text-sm text-gray-400">
                  Meetings
                </p>
                <h3 className="mt-2 text-3xl font-bold">
                  {stats?.totalMeetings ??
                    0}
                </h3>
              </div>

              <div className="rounded-lg border border-gray-800 bg-[#111827] p-5">
                <p className="text-sm text-gray-400">
                  Hours
                </p>
                <h3 className="mt-2 text-3xl font-bold">
                  {stats?.totalHours ??
                    0}
                  h
                </h3>
              </div>

              <div className="rounded-lg border border-gray-800 bg-[#111827] p-5">
                <p className="text-sm text-gray-400">
                  Call partners
                </p>
                <h3 className="mt-2 text-3xl font-bold">
                  {stats?.uniquePeople ??
                    0}
                </h3>
              </div>

              <div className="rounded-lg border border-gray-800 bg-[#111827] p-5">
                <p className="text-sm text-gray-400">
                  Most called
                </p>
                <h3 className="mt-2 truncate text-2xl font-bold">
                  {stats?.mostCalled?.name ||
                    "None yet"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {stats?.mostCalled
                    ? `${stats.mostCalled.calls} calls`
                    : `${stats?.videoCalls ?? 0} video, ${stats?.audioCalls ?? 0} audio`}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
