"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { socket } from "@/lib/socket";

import { useMedia } from "@/hooks/useMedia";

import { useWebRTC } from "@/hooks/useWebRTC";

import ParticipantGrid from "./ParticipantGrid";

import MeetingControls from "./MeetingControls";
import MeetingChat from "./MeetingChat";
import MeetingInvite from "./MeetingInvite";
import Whiteboard from "./Whiteboard";

interface Props {
  roomId: string;
}

const formatElapsed = (
  seconds: number
) => {
  const hrs = Math.floor(
    seconds / 3600
  );
  const mins = Math.floor(
    (seconds % 3600) / 60
  );
  const secs = seconds % 60;

  const pad = (value: number) =>
    String(value).padStart(2, "0");

  return hrs > 0
    ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
    : `${pad(mins)}:${pad(secs)}`;
};

export default function MeetingRoom({
  roomId,
}: Props) {
  const router = useRouter();
  const searchParams =
    useSearchParams();
  const callType =
    searchParams.get("type") ===
    "audio"
      ? "audio"
      : "video";

  const {
    stream,
    audioEnabled,
    videoEnabled,
    mediaError,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    shareCanvasStream,
  } = useMedia({
    initialVideo:
      callType === "video",
  });

  const [
    participantCount,
    setParticipantCount,
  ] = useState(1);
  const [
    whiteboardOpen,
    setWhiteboardOpen,
  ] = useState(false);
  const [panelOpen, setPanelOpen] =
    useState(false);
  const [copied, setCopied] =
    useState(false);
  const [meetingEnded, setMeetingEnded] =
    useState(false);
  const [elapsed, setElapsed] =
    useState(0);
  const copyTimerRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  useWebRTC(roomId, stream);

  useEffect(() => {
    const timer = setInterval(
      () =>
        setElapsed(
          (current) => current + 1
        ),
      1000
    );

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const handleParticipantCount = (
      count: number
    ) => {
      setParticipantCount(count);
    };

    socket.on(
      "participant-count",
      handleParticipantCount
    );

    const handleMeetingEnded = () => {
      setMeetingEnded(true);
    };

    socket.on(
      "meeting-ended",
      handleMeetingEnded
    );

    return () => {
      socket.off(
        "participant-count",
        handleParticipantCount
      );
      socket.off(
        "meeting-ended",
        handleMeetingEnded
      );
    };
  }, [roomId]);

  const copyInviteLink = async () => {
    const link = window.location.href;

    try {
      await navigator.clipboard.writeText(
        link
      );
    } catch {
      // Clipboard API needs a secure context; fall back for plain http.
      const textarea =
        document.createElement(
          "textarea"
        );
      textarea.value = link;
      document.body.appendChild(
        textarea
      );
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(
        textarea
      );
    }

    setCopied(true);

    if (copyTimerRef.current) {
      clearTimeout(
        copyTimerRef.current
      );
    }

    copyTimerRef.current = setTimeout(
      () => setCopied(false),
      2000
    );
  };

  const leaveMeeting = () => {
    socket.emit(
      "leave-meeting",
      roomId
    );

    window.location.href =
      "/dashboard";
  };

  if (meetingEnded) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0b0f19] px-6 text-center text-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
            <path d="M23 1L1 23" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold">
          This meeting has ended
        </h1>

        <p className="max-w-sm text-gray-400">
          The room is closed. You can
          start a new meeting from your
          dashboard.
        </p>

        <button
          onClick={() =>
            router.push("/dashboard")
          }
          className="mt-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0f19] p-3 text-white sm:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold sm:text-2xl">
            {callType === "audio"
              ? "Audio Call"
              : "Meeting"}
          </h1>

          <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
            <span className="max-w-40 truncate sm:max-w-xs">
              {roomId}
            </span>

            <button
              onClick={copyInviteLink}
              className={[
                "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition",
                copied
                  ? "bg-emerald-600/20 text-emerald-400"
                  : "bg-white/10 text-gray-300 hover:bg-white/20",
              ].join(" ")}
            >
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy link
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="rounded-xl bg-[#1a2235] px-3 py-2 text-sm">
            {formatElapsed(elapsed)}
          </span>

          <span className="flex items-center gap-2 rounded-xl bg-[#1a2235] px-3 py-2 text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {participantCount}
          </span>
        </div>
      </div>

      {mediaError ? (
        <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          {mediaError}
        </div>
      ) : null}

      <ParticipantGrid
        localStream={stream}
      />

      {whiteboardOpen ? (
        <Whiteboard
          roomId={roomId}
          onShareWhiteboard={
            shareCanvasStream
          }
        />
      ) : null}

      {/* Chat / tools panel */}
      <div className="fixed bottom-28 right-3 z-40 sm:bottom-24 sm:right-6">
        {panelOpen ? (
          <div className="fixed inset-x-3 bottom-28 flex h-[65vh] flex-col gap-3 rounded-xl border border-gray-800 bg-[#0b0f19] p-3 shadow-2xl sm:inset-x-auto sm:right-6 sm:h-[34rem] sm:max-h-[70vh] sm:w-96">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">
                Meeting Tools
              </h2>
              <button
                onClick={() =>
                  setPanelOpen(false)
                }
                className="rounded bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
              >
                Minimize
              </button>
            </div>

            <MeetingInvite
              roomId={roomId}
              callType={callType}
            />
            <div className="min-h-0 flex-1">
              <MeetingChat
                roomId={roomId}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={() =>
              setPanelOpen(true)
            }
            aria-label="Open chat and tools"
            className="flex h-13 w-13 items-center justify-center rounded-full bg-indigo-600 shadow-2xl hover:bg-indigo-500 sm:h-14 sm:w-14"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        )}
      </div>

      <MeetingControls
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        startScreenShare={
          startScreenShare
        }
        leaveMeeting={leaveMeeting}
        toggleWhiteboard={() =>
          setWhiteboardOpen(
            (current) => !current
          )
        }
        whiteboardOpen={whiteboardOpen}
      />
    </div>
  );
}
