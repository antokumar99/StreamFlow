"use client";

import {
  FormEvent,
  useState,
} from "react";

import api from "@/lib/axios";

interface Props {
  roomId: string;
  callType: "video" | "audio";
}

export default function MeetingInvite({
  roomId,
  callType,
}: Props) {
  const [username, setUsername] =
    useState("");
  const [notice, setNotice] =
    useState("");
  const [sending, setSending] =
    useState(false);

  const inviteUser = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    const value =
      username.trim();
    if (!value) return;

    try {
      setSending(true);
      const response =
        await api.post(
          "/meetings/invite",
          {
            username: value,
            roomId,
            callType,
          }
        );

      setNotice(
        `Invitation sent to ${response.data.invitedUser.name}`
      );
      setUsername("");
    } catch (error: unknown) {
      const maybeError =
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };

      setNotice(
        maybeError.response?.data
          ?.message ||
          "Failed to send invitation"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="rounded-lg border border-gray-800 bg-[#111827] p-4">
      <h2 className="font-semibold">
        Invite by username
      </h2>

      <form
        onSubmit={inviteUser}
        className="mt-3 flex gap-2"
      >
        <input
          value={username}
          onChange={(event) =>
            setUsername(
              event.target.value
            )
          }
          placeholder="Username"
          className="min-w-0 flex-1 rounded border border-gray-700 bg-[#0b0f19] px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        <button
          disabled={sending}
          className="rounded bg-emerald-600 px-4 py-2 text-sm hover:bg-emerald-700 disabled:opacity-60"
        >
          {sending
            ? "Sending"
            : "Invite"}
        </button>
      </form>

      {notice ? (
        <p className="mt-2 text-sm text-gray-400">
          {notice}
        </p>
      ) : null}
    </section>
  );
}
