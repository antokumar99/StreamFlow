"use client";

import {
  useEffect,
  useState,
} from "react";

import api from "@/lib/axios";

import MeetingCard from "./MeetingCard";

interface Meeting {
  _id: string;
  roomId: string;
  participantCount: number;
  participants?: unknown[];
  startedAt: string;
  updatedAt: string;
  isActive: boolean;
}

const formatMeetingTime = (
  value: string
) => {
  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));
};

export default function RecentMeetings() {
  const [
    meetings,
    setMeetings,
  ] = useState<Meeting[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    const fetchMeetings =
      async () => {
        try {
          const response =
            await api.get(
              "/meetings"
            );

          setMeetings(
            response.data.meetings ||
              []
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

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Recent Meetings
      </h2>

      {loading ? (
        <p className="text-gray-400">
          Loading meetings...
        </p>
      ) : meetings.length === 0 ? (
        <p className="text-gray-400">
          No meetings yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {meetings.map(
            (meeting) => (
              <MeetingCard
                key={
                  meeting._id
                }
                title={
                  meeting.isActive
                    ? "Active Meeting"
                    : "Meeting"
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
                roomId={
                  meeting.roomId
                }
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
