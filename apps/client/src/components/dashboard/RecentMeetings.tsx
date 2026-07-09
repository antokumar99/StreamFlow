"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import api from "@/lib/axios";

import MeetingCard from "./MeetingCard";

export interface Meeting {
  _id: string;
  roomId: string;
  callType?: "video" | "audio";
  participantCount: number;
  participants?: {
    _id: string;
    name?: string;
  }[];
  hostId?: {
    _id: string;
    name?: string;
  } | null;
  startedAt: string;
  endedAt?: string | null;
  updatedAt: string;
  isActive: boolean;
}

const RECENT_LIMIT = 6;

export const formatMeetingTime = (
  value: string
) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const getDurationLabel = (
  meeting: Meeting
) => {
  if (!meeting.startedAt) return "";

  const end = meeting.endedAt
    ? new Date(meeting.endedAt)
    : meeting.isActive
      ? new Date()
      : null;

  if (!end) return "";

  const minutes = Math.max(
    0,
    Math.round(
      (end.getTime() -
        new Date(
          meeting.startedAt
        ).getTime()) /
        60000
    )
  );

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  return `${hours}h ${minutes % 60}m`;
};

export default function RecentMeetings() {
  const [meetings, setMeetings] =
    useState<Meeting[]>([]);
  const [loading, setLoading] =
    useState(true);

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

  const visibleMeetings =
    meetings.slice(0, RECENT_LIMIT);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          Recent Meetings
        </h2>

        {meetings.length >
        RECENT_LIMIT ? (
          <Link
            href="/meeting"
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            View all (
            {meetings.length})
          </Link>
        ) : null}
      </div>

      {loading ? (
        <p className="text-gray-400">
          Loading meetings...
        </p>
      ) : visibleMeetings.length ===
        0 ? (
        <div className="rounded-2xl border border-dashed border-gray-800 p-10 text-center">
          <p className="text-gray-400">
            No meetings yet.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Start your first meeting with
            the button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6">
          {visibleMeetings.map(
            (meeting) => (
              <MeetingCard
                key={meeting._id}
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
                  meeting.participants
                    ?.length ||
                  meeting.participantCount ||
                  0
                }
                roomId={meeting.roomId}
                callType={
                  meeting.callType ===
                  "audio"
                    ? "audio"
                    : "video"
                }
                isActive={
                  meeting.isActive
                }
                hostName={
                  meeting.hostId?.name
                }
                durationLabel={getDurationLabel(
                  meeting
                )}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
