"use client";

import {
  useEffect,
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
  const [
    panelOpen,
    setPanelOpen,
  ] = useState(false);

  useWebRTC(
    roomId,
    stream,
    callType
  );

  useEffect(() => {
    if (!roomId) return;

    const handleParticipantCount =
      (count: number) => {
        setParticipantCount(
          count
        );
      };

    socket.on(
      "participant-count",
      handleParticipantCount
    );

    const handleMeetingEnded = () => {
      alert(
        "This meeting room has ended."
      );
      router.push("/dashboard");
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
  }, [roomId, router]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            StreamFlow{" "}
            {callType === "audio"
              ? "Audio Call"
              : "Meeting"}
          </h1>

          <p className="text-gray-400 mt-1">
            Room ID: {roomId}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[#1a2235] px-4 py-2 rounded-xl">
            Participants:{" "}
            {participantCount}
          </div>

          <button
            onClick={() =>
              navigator.clipboard.writeText(
                window.location.href
              )
            }
            className="bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 rounded-xl"
          >
            Copy Invite Link
          </button>
        </div>
      </div>

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

      <div className="fixed bottom-24 right-6 z-40">
        {panelOpen ? (
          <div className="flex h-[560px] w-[340px] max-w-[calc(100vw-48px)] flex-col gap-3 rounded-lg border border-gray-800 bg-[#0b0f19] p-3 shadow-2xl">
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
              <MeetingChat roomId={roomId} />
            </div>
          </div>
        ) : (
          <button
            onClick={() =>
              setPanelOpen(true)
            }
            className="rounded-full bg-indigo-600 px-5 py-4 font-semibold shadow-2xl hover:bg-indigo-700"
          >
            Chat
          </button>
        )}
      </div>

      <MeetingControls
        audioEnabled={
          audioEnabled
        }
        videoEnabled={
          videoEnabled
        }
        toggleAudio={
          toggleAudio
        }
        toggleVideo={
          toggleVideo
        }
        startScreenShare={
          startScreenShare
        }
        leaveMeeting={() => {
          socket.emit(
            "leave-meeting",
            roomId
          );

          window.location.href =
            "/dashboard";
        }}
        toggleWhiteboard={() =>
          setWhiteboardOpen(
            (current) => !current
          )
        }
        whiteboardOpen={
          whiteboardOpen
        }
      />
    </div>
  );
}
