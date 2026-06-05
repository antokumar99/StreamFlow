"use client";

import {
  useEffect,
  useState,
} from "react";

import { socket } from "@/lib/socket";

import { useMedia } from "@/hooks/useMedia";

import { useWebRTC } from "@/hooks/useWebRTC";

import ParticipantGrid from "./ParticipantGrid";

import MeetingControls from "./MeetingControls";

interface Props {
  roomId: string;
}

export default function MeetingRoom({
  roomId,
}: Props) {
  const {
    stream,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    startScreenShare,
  } = useMedia();

  const [
    participantCount,
    setParticipantCount,
  ] = useState(1);

  useWebRTC(roomId, stream);

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

    return () => {
      socket.off(
        "participant-count",
        handleParticipantCount
      );
    };
  }, [roomId]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            StreamFlow Meeting
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
      />
    </div>
  );
}
