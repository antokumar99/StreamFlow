"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardStats from "@/components/dashboard/DashboardStats";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentMeetings from "@/components/dashboard/RecentMeetings";


import { useRouter } from "next/navigation";
import {
  useRef,
  useState,
} from "react";
import api from "@/lib/axios";



export default function DashboardPage() {

  const router = useRouter();
  const [loading, setLoading] =
    useState(false);
  const [roomId, setRoomId] = useState("");
  const joinInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const handleCreateMeeting = async (
    callType: "video" | "audio" = "video"
  ) => {
    try {
      setLoading(true);
      const response =
        await api.post(
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
      console.error("Error creating meeting:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinMeeting = () => {
    const value =
      roomId.trim();

    if (!value) {
      alert("Please enter a valid Room ID");
      return;
    }

    const roomFromLink =
      value.match(
        /\/meeting\/([^/?#]+)/
      )?.[1];

    router.push(
      `/meeting/${roomFromLink || value}`
    );
  };

  return (

    <ProtectedRoute>
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-400 mt-2">
          Welcome to StreamFlow
        </p>

        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={() =>
              handleCreateMeeting(
                "video"
              )
            }
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-400 transition">
            {loading ? "Creating..." : "New Meeting"}
          </button>
        
          <input
            type="text"
            placeholder="Enter Room ID to Join"
            value={roomId}
            ref={joinInputRef}
            onChange={(e) => setRoomId(e.target.value)}
            className="mt-4 p-2 border rounded w-full max-w-sm"
          />  
          <button
            onClick={joinMeeting}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-400 transition">
            Join Meeting
          </button>
        </div>

        </div>

      {/* Stats */}
        <DashboardStats />

      {/* Quick Actions */}
      <QuickActions
        onCreateVideo={() =>
          handleCreateMeeting(
            "video"
          )
        }
        onCreateAudio={() =>
          handleCreateMeeting(
            "audio"
          )
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
