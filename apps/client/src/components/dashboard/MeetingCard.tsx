"use client";

import { useRouter } from "next/navigation";

interface MeetingCardProps {
  title: string;
  time: string;
  participants: number;
  roomId?: string;
  callType?: "video" | "audio";
  isActive?: boolean;
  hostName?: string;
  durationLabel?: string;
}

export default function MeetingCard({
  title,
  time,
  participants,
  roomId,
  callType = "video",
  isActive = false,
  hostName,
  durationLabel,
}: MeetingCardProps) {
  const router = useRouter();

  return (
    <div className="glass flex flex-col rounded-2xl p-5 transition hover:border-indigo-500/60">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              callType === "audio"
                ? "bg-cyan-500/20 text-cyan-400"
                : "bg-indigo-500/20 text-indigo-400",
            ].join(" ")}
          >
            {callType === "audio" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold">
              {title}
            </h3>
            <p className="truncate text-sm text-gray-400">
              {time}
            </p>
          </div>
        </div>

        {isActive ? (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {participants}{" "}
          {participants === 1
            ? "participant"
            : "participants"}
        </span>

        {durationLabel ? (
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            {durationLabel}
          </span>
        ) : null}
      </div>

      {hostName ? (
        <p className="mt-1 truncate text-sm text-gray-500">
          Hosted by {hostName}
        </p>
      ) : null}

      <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-4">
        <span className="max-w-[55%] truncate text-xs text-gray-500">
          {roomId}
        </span>

        {isActive ? (
          <button
            onClick={() => {
              if (roomId) {
                router.push(
                  `/meeting/${roomId}${
                    callType === "audio"
                      ? "?type=audio"
                      : ""
                  }`
                );
              }
            }}
            disabled={!roomId}
            className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Join
          </button>
        ) : (
          <span className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-400">
            Ended
          </span>
        )}
      </div>
    </div>
  );
}
