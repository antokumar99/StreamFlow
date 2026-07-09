"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MeetingCard from "@/components/dashboard/MeetingCard";
import {
  formatMeetingTime,
  getDurationLabel,
  Meeting,
} from "@/components/dashboard/RecentMeetings";
import api from "@/lib/axios";

export default function MeetingsPage() {
  const router = useRouter();

  const [meetings, setMeetings] =
    useState<Meeting[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [creating, setCreating] =
    useState(false);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await api.get(
          "/meetings"
        );

        setMeetings(
          response.data.meetings || []
        );
      } catch (error) {
        console.error(
          "Failed to load meetings:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const createMeeting = async () => {
    if (creating) return;

    try {
      setCreating(true);

      const response = await api.post(
        "/meetings",
        {
          callType: "video",
        }
      );

      router.push(
        `/meeting/${response.data.meeting.roomId}`
      );
    } catch (error) {
      console.error(
        "Failed to create meeting:",
        error
      );
      setCreating(false);
    }
  };

  const activeMeetings =
    meetings.filter(
      (meeting) => meeting.isActive
    );
  const pastMeetings = meetings.filter(
    (meeting) => !meeting.isActive
  );

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#0b0f19] px-4 py-6 text-white sm:px-6">
        <div className="mx-auto max-w-6xl space-y-8">
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

              <h1 className="text-2xl font-bold sm:text-3xl">
                My Meetings
              </h1>
            </div>

            <button
              onClick={createMeeting}
              disabled={creating}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold transition hover:bg-indigo-500 disabled:opacity-60"
            >
              {creating
                ? "Creating..."
                : "New Meeting"}
            </button>
          </div>

          {loading ? (
            <p className="text-gray-400">
              Loading meetings...
            </p>
          ) : meetings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center">
              <p className="text-gray-400">
                You have no meetings yet.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Create one to get
                started.
              </p>
            </div>
          ) : (
            <>
              {activeMeetings.length >
              0 ? (
                <section>
                  <h2 className="mb-4 text-xl font-semibold">
                    Active now
                  </h2>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6">
                    {activeMeetings.map(
                      (meeting) => (
                        <MeetingCard
                          key={
                            meeting._id
                          }
                          title={
                            meeting.callType ===
                            "audio"
                              ? "Audio Call"
                              : "Video Meeting"
                          }
                          time={formatMeetingTime(
                            meeting.startedAt ||
                              meeting.updatedAt
                          )}
                          participants={
                            meeting
                              .participants
                              ?.length ||
                            meeting.participantCount ||
                            0
                          }
                          roomId={
                            meeting.roomId
                          }
                          callType={
                            meeting.callType ===
                            "audio"
                              ? "audio"
                              : "video"
                          }
                          isActive
                          hostName={
                            meeting
                              .hostId
                              ?.name
                          }
                          durationLabel={getDurationLabel(
                            meeting
                          )}
                        />
                      )
                    )}
                  </div>
                </section>
              ) : null}

              {pastMeetings.length >
              0 ? (
                <section>
                  <h2 className="mb-4 text-xl font-semibold">
                    Past meetings
                  </h2>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6">
                    {pastMeetings.map(
                      (meeting) => (
                        <MeetingCard
                          key={
                            meeting._id
                          }
                          title={
                            meeting.callType ===
                            "audio"
                              ? "Audio Call"
                              : "Video Meeting"
                          }
                          time={formatMeetingTime(
                            meeting.startedAt ||
                              meeting.updatedAt
                          )}
                          participants={
                            meeting
                              .participants
                              ?.length ||
                            meeting.participantCount ||
                            0
                          }
                          roomId={
                            meeting.roomId
                          }
                          callType={
                            meeting.callType ===
                            "audio"
                              ? "audio"
                              : "video"
                          }
                          hostName={
                            meeting
                              .hostId
                              ?.name
                          }
                          durationLabel={getDurationLabel(
                            meeting
                          )}
                        />
                      )
                    )}
                  </div>
                </section>
              ) : null}
            </>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
