"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { socket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";

interface Props {
  roomId: string;
}

interface MeetingMessage {
  id: string;
  roomId: string;
  message: string;
  senderId?: string;
  senderName: string;
  createdAt: string;
}

const formatTime = (value: string) =>
  new Intl.DateTimeFormat(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date(value));

export default function MeetingChat({
  roomId,
}: Props) {
  const { user } =
    useAuthStore();
  const [messages, setMessages] =
    useState<MeetingMessage[]>([]);
  const [text, setText] =
    useState("");

  useEffect(() => {
    const handleMessage = (
      message: MeetingMessage
    ) => {
      if (message.roomId !== roomId) {
        return;
      }

      setMessages((current) => [
        ...current,
        message,
      ]);
    };

    socket.on(
      "meeting-chat-message",
      handleMessage
    );

    return () => {
      socket.off(
        "meeting-chat-message",
        handleMessage
      );
    };
  }, [roomId]);

  const sendMessage = (
    event: FormEvent
  ) => {
    event.preventDefault();

    const value = text.trim();
    if (!value) return;

    socket.emit(
      "meeting-chat-message",
      {
        roomId,
        message: value,
      }
    );
    setText("");
  };

  return (
    <section className="flex h-full min-h-0 flex-col rounded-lg border border-gray-800 bg-[#111827]">
      <div className="border-b border-gray-800 px-4 py-3">
        <h2 className="font-semibold">
          Meeting Chat
        </h2>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">
            No messages yet.
          </p>
        ) : (
          messages.map((message) => {
            const isMine =
              String(message.senderId) ===
              String(user?._id);

            return (
              <div
                key={message.id}
                className={[
                  "rounded-lg px-3 py-2",
                  isMine
                    ? "bg-indigo-600"
                    : "bg-gray-800",
                ].join(" ")}
              >
                <div className="mb-1 flex items-center justify-between gap-3 text-xs text-white/70">
                  <span className="truncate">
                    {message.senderName}
                  </span>
                  <span className="shrink-0">
                    {formatTime(
                      message.createdAt
                    )}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm">
                  {message.message}
                </p>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={sendMessage}
        className="flex gap-2 border-t border-gray-800 p-3"
      >
        <input
          value={text}
          onChange={(event) =>
            setText(
              event.target.value
            )
          }
          placeholder="Message everyone"
          className="min-w-0 flex-1 rounded border border-gray-700 bg-[#0b0f19] px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        <button className="rounded bg-indigo-600 px-4 py-2 text-sm hover:bg-indigo-700">
          Send
        </button>
      </form>
    </section>
  );
}
