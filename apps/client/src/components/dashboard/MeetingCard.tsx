"use client";

import { useRouter } from "next/navigation";

interface MeetingCardProps {
  title: string;
  time: string;
  participants: number;
  roomId?: string;
}

export default function MeetingCard({
  title,
  time,
  participants,
  roomId,
}: MeetingCardProps) {
  const router = useRouter();

  return (
    <div className="glass p-5 rounded-2xl">
      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <p className="text-gray-400 mt-2">
        {time}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-400">
          {participants} participants
        </span>

        <button
          onClick={() => {
            if (roomId) {
              router.push(
                `/meeting/${roomId}`
              );
            }
          }}
          disabled={!roomId}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Join
        </button>
      </div>
    </div>
  );
}
