"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardStats from "@/components/dashboard/DashboardStats";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentMeetings from "@/components/dashboard/RecentMeetings";


import { useRouter } from "next/navigation";
import { useState } from "react";



export default function DashboardPage() {

  const router = useRouter();
  const [loading, setLoading] =
    useState(false);
  const [roomId, setRoomId] = useState("");

  const handleCreateMeeting = async () => {
    try {
      const newRoomId = crypto.randomUUID();
      setRoomId(newRoomId);


      setLoading(true);
      // Simulate API call to create meeting
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Navigate to the newly created meeting room
      router.push(`/meeting/${roomId}`);
    } catch (error) {
      console.error("Error creating meeting:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinMeeting = () => {
    if (!roomId.trim()) {
      alert("Please enter a valid Room ID");
      return;
    }
    router.push(`/meeting/${roomId}`);
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
            onClick={handleCreateMeeting}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-400 transition">
            {loading ? "Creating..." : "New Meeting"}
          </button>
        
          <input
            type="text"
            placeholder="Enter Room ID to Join"
            value={roomId}
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
      <QuickActions />

      {/* Meetings */}
      <RecentMeetings />
    </div>
    </ProtectedRoute>

  );
}
