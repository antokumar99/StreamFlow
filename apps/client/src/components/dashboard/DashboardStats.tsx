"use client";

import {
  useEffect,
  useState,
} from "react";

import api from "@/lib/axios";

interface MeetingStats {
  totalMeetings: number;
  totalHours: number;
  uniquePeople: number;
  summaryCount: number;
  activeMeetings: number;
  videoCalls: number;
  audioCalls: number;
  mostCalled?: {
    name: string;
    calls: number;
    minutes: number;
  } | null;
}

export default function DashboardStats() {
  const [stats, setStats] =
    useState<MeetingStats | null>(
      null
    );
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response =
          await api.get(
            "/meetings/stats"
          );

        setStats(
          response.data.stats
        );
      } catch (error) {
        console.error(
          "Failed to load meeting stats:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const cards = [
    {
      title: "Total Meetings",
      value:
        stats?.totalMeetings ?? 0,
      detail: `${stats?.activeMeetings ?? 0} active now`,
    },
    {
      title: "Hours Spent",
      value: `${stats?.totalHours ?? 0}h`,
      detail: `${stats?.videoCalls ?? 0} video, ${stats?.audioCalls ?? 0} audio`,
    },
    {
      title: "People Called",
      value:
        stats?.uniquePeople ?? 0,
      detail:
        stats?.mostCalled
          ? `Most: ${stats.mostCalled.name}`
          : "No call partners yet",
    },
    {
      title: "AI Summaries",
      value:
        stats?.summaryCount ?? 0,
      detail:
        "Generated from meetings",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((stat, index) => (
        <div
          key={index}
          className="glass p-6 rounded-2xl"
        >
          <p className="text-gray-400 text-sm">
            {stat.title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {loading
              ? "..."
              : stat.value}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {stat.detail}
          </p>
        </div>
      ))}
    </div>
  );
}
