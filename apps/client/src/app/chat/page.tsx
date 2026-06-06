"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import api from "@/lib/axios";
import { socket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Conversation {
  _id: string;
  name?: string;
  type: "direct" | "group";
  members: User[];
  lastMessageAt?: string;
}

type MessageType =
  | "text"
  | "photo"
  | "voice";

interface ChatMessage {
  _id: string;
  conversationId: string;
  sender: User;
  type: MessageType;
  payload: {
    text?: string;
    dataUrl?: string;
    fileName?: string;
    mimeType?: string;
    durationMs?: number;
  };
  createdAt: string;
}

const readFileAsDataUrl = (
  file: File
) =>
  new Promise<string>(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () =>
        resolve(
          String(reader.result)
        );

      reader.onerror =
        reject;

      reader.readAsDataURL(
        file
      );
    }
  );

export default function ChatPage() {
  const { user } =
    useAuthStore();

  const [
    conversations,
    setConversations,
  ] = useState<Conversation[]>(
    []
  );

  const [
    activeConversation,
    setActiveConversation,
  ] = useState<Conversation | null>(
    null
  );

  const [
    messages,
    setMessages,
  ] = useState<ChatMessage[]>(
    []
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    users,
    setUsers,
  ] = useState<User[]>([]);

  const [
    selectedGroupUsers,
    setSelectedGroupUsers,
  ] = useState<User[]>([]);

  const [
    groupName,
    setGroupName,
  ] = useState("");

  const [
    text,
    setText,
  ] = useState("");

  const [
    notice,
    setNotice,
  ] = useState("");

  const [
    isRecording,
    setIsRecording,
  ] = useState(false);

  const recorderRef =
    useRef<MediaRecorder | null>(
      null
    );

  const chunksRef =
    useRef<Blob[]>([]);

  const recordingStartedAtRef =
    useRef(0);

  const activeConversationId =
    activeConversation?._id;

  const currentMessages =
    useMemo(
      () =>
        messages.filter(
          (message) =>
            message.conversationId ===
            activeConversationId
        ),
      [
        messages,
        activeConversationId,
      ]
    );

  const getConversationTitle = (
    conversation: Conversation
  ) => {
    if (
      conversation.type ===
      "group"
    ) {
      return (
        conversation.name ||
        "Group chat"
      );
    }

    const otherMember =
      conversation.members.find(
        (member) =>
          member._id !==
          user?._id
      );

    return (
      otherMember?.name ||
      "Direct chat"
    );
  };

  useEffect(() => {
    const loadConversations =
      async () => {
        const response =
          await api.get(
            "/chats/conversations"
          );

        setConversations(
          response.data
            .conversations || []
        );
      };

    loadConversations();
  }, []);

  useEffect(() => {
    if (search.trim().length < 2) {
      return;
    }

    const timeoutId =
      window.setTimeout(
        async () => {
          const response =
            await api.get(
              "/chats/users",
              {
                params: {
                  q: search,
                },
              }
            );

          setUsers(
            response.data.users ||
              []
          );
        },
        250
      );

    return () =>
      window.clearTimeout(
        timeoutId
      );
  }, [search]);

  const visibleUsers =
    search.trim().length < 2
      ? []
      : users;

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleMessage =
      (message: ChatMessage) => {
        setMessages(
          (current) => {
            if (
              current.some(
                (item) =>
                  item._id ===
                  message._id
              )
            ) {
              return current;
            }

            return [
              ...current,
              message,
            ];
          }
        );
      };

    const handleNotification =
      (notification: {
        message: string;
      }) => {
        setNotice(
          notification.message
        );

        window.setTimeout(
          () => setNotice(""),
          4000
        );
      };

    socket.on(
      "receive-chat-message",
      handleMessage
    );

    socket.on(
      "notification",
      handleNotification
    );

    return () => {
      socket.off(
        "receive-chat-message",
        handleMessage
      );

      socket.off(
        "notification",
        handleNotification
      );
    };
  }, []);

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    const loadMessages =
      async () => {
        const response =
          await api.get(
            `/chats/conversations/${activeConversationId}/messages`
          );

        setMessages(
          (current) => {
            const otherMessages =
              current.filter(
                (message) =>
                  message.conversationId !==
                  activeConversationId
              );

            return [
              ...otherMessages,
              ...(response.data
                .messages || []),
            ];
          }
        );
      };

    socket.emit(
      "join-conversation",
      activeConversationId
    );

    loadMessages();
  }, [activeConversationId]);

  const startDirectChat =
    async (targetUser: User) => {
      const response =
        await api.post(
          "/chats/conversations/direct",
          {
            userId:
              targetUser._id,
          }
        );

      const conversation =
        response.data.conversation;

      setConversations(
        (current) => {
          const exists =
            current.some(
              (item) =>
                item._id ===
                conversation._id
            );

          return exists
            ? current
            : [
                conversation,
                ...current,
              ];
        }
      );

      setActiveConversation(
        conversation
      );
      setSearch("");
      setUsers([]);
    };

  const createGroup =
    async () => {
      if (
        !groupName.trim() ||
        selectedGroupUsers.length < 2
      ) {
        setNotice(
          "Add a group name and at least two users."
        );
        return;
      }

      const response =
        await api.post(
          "/chats/conversations/group",
          {
            name: groupName.trim(),
            memberIds:
              selectedGroupUsers.map(
                (member) =>
                  member._id
              ),
          }
        );

      const conversation =
        response.data.conversation;

      setConversations(
        (current) => [
          conversation,
          ...current,
        ]
      );
      setActiveConversation(
        conversation
      );
      setSelectedGroupUsers([]);
      setGroupName("");
    };

  const sendMessage = (
    type: MessageType,
    payload: ChatMessage["payload"]
  ) => {
    if (!activeConversationId) {
      setNotice(
        "Select a chat first."
      );
      return;
    }

    socket.emit(
      "send-chat-message",
      {
        conversationId:
          activeConversationId,
        type,
        payload,
      }
    );
  };

  const sendText = () => {
    const value =
      text.trim();

    if (!value) return;

    sendMessage("text", {
      text: value,
    });

    setText("");
  };

  const sendPhoto =
    async (
      event: ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      const dataUrl =
        await readFileAsDataUrl(
          file
        );

      sendMessage("photo", {
        dataUrl,
        fileName:
          file.name,
        mimeType:
          file.type,
      });

      event.target.value = "";
    };

  const startRecording =
    async () => {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
          }
        );

      const recorder =
        new MediaRecorder(stream);

      chunksRef.current = [];
      recordingStartedAtRef.current =
        Date.now();

      recorder.ondataavailable =
        (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(
              event.data
            );
          }
        };

      recorder.onstop =
        async () => {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          const blob =
            new Blob(
              chunksRef.current,
              {
                type:
                  "audio/webm",
              }
            );

          const file =
            new File(
              [blob],
              "voice-message.webm",
              {
                type:
                  "audio/webm",
              }
            );

          const dataUrl =
            await readFileAsDataUrl(
              file
            );

          sendMessage("voice", {
            dataUrl,
            fileName:
              file.name,
            mimeType:
              file.type,
            durationMs:
              Date.now() -
              recordingStartedAtRef.current,
          });
        };

      recorderRef.current =
        recorder;
      recorder.start();
      setIsRecording(true);
    };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setIsRecording(false);
  };

  const toggleGroupUser = (
    targetUser: User
  ) => {
    setSelectedGroupUsers(
      (current) =>
        current.some(
          (member) =>
            member._id ===
            targetUser._id
        )
          ? current.filter(
              (member) =>
                member._id !==
                targetUser._id
            )
          : [
              ...current,
              targetUser,
            ]
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0b0f19] p-6 text-white">
        {notice ? (
          <div className="fixed right-6 top-6 z-50 rounded bg-indigo-600 px-4 py-3 shadow-lg">
            {notice}
          </div>
        ) : null}

        <div className="grid h-[calc(100vh-48px)] grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
          <aside className="flex min-h-0 flex-col rounded-lg border border-gray-800 bg-[#111827]">
            <div className="border-b border-gray-800 p-4">
              <h1 className="text-2xl font-semibold">
                Chat
              </h1>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search by user name"
                className="mt-4 w-full rounded border border-gray-700 bg-[#0b0f19] px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />

              {visibleUsers.length > 0 ? (
                <div className="mt-3 max-h-48 overflow-y-auto rounded border border-gray-800">
                  {visibleUsers.map(
                    (item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between gap-2 border-b border-gray-800 p-2 last:border-b-0"
                      >
                        <button
                          onClick={() =>
                            startDirectChat(
                              item
                            )
                          }
                          className="min-w-0 flex-1 text-left"
                        >
                          <p className="truncate text-sm font-medium">
                            {item.name}
                          </p>
                          <p className="truncate text-xs text-gray-400">
                            {item.email}
                          </p>
                        </button>

                        <button
                          onClick={() =>
                            toggleGroupUser(
                              item
                            )
                          }
                          className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
                        >
                          {selectedGroupUsers.some(
                            (member) =>
                              member._id ===
                              item._id
                          )
                            ? "Remove"
                            : "Group"}
                        </button>
                      </div>
                    )
                  )}
                </div>
              ) : null}

              <div className="mt-4 rounded border border-gray-800 p-3">
                <input
                  value={groupName}
                  onChange={(event) =>
                    setGroupName(
                      event.target.value
                    )
                  }
                  placeholder="Group name"
                  className="w-full rounded border border-gray-700 bg-[#0b0f19] px-3 py-2 text-sm outline-none focus:border-indigo-400"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Selected:{" "}
                  {selectedGroupUsers.length}
                </p>

                <button
                  onClick={createGroup}
                  className="mt-3 w-full rounded bg-indigo-600 px-3 py-2 text-sm hover:bg-indigo-700"
                >
                  Create Group
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {conversations.map(
                (conversation) => (
                  <button
                    key={
                      conversation._id
                    }
                    onClick={() =>
                      setActiveConversation(
                        conversation
                      )
                    }
                    className={[
                      "mb-2 w-full rounded-lg border p-3 text-left transition",
                      activeConversationId ===
                      conversation._id
                        ? "border-indigo-400 bg-indigo-500/15"
                        : "border-gray-800 bg-white/5 hover:border-gray-600",
                    ].join(" ")}
                  >
                    <p className="truncate font-medium">
                      {getConversationTitle(
                        conversation
                      )}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {conversation.type ===
                      "group"
                        ? `${conversation.members.length} members`
                        : "Direct message"}
                    </p>
                  </button>
                )
              )}
            </div>
          </aside>

          <main className="flex min-h-0 flex-col rounded-lg border border-gray-800 bg-[#111827]">
            {activeConversation ? (
              <>
                <div className="border-b border-gray-800 p-4">
                  <h2 className="text-xl font-semibold">
                    {getConversationTitle(
                      activeConversation
                    )}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {activeConversation.members
                      .map(
                        (member) =>
                          member.name
                      )
                      .join(", ")}
                  </p>
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                  {currentMessages.map(
                    (message) => {
                      const isMine =
                        message.sender
                          ?._id ===
                        user?._id;

                      return (
                        <div
                          key={
                            message._id
                          }
                          className={`flex ${
                            isMine
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[72%] rounded-lg px-3 py-2 ${
                              isMine
                                ? "bg-indigo-600"
                                : "bg-gray-800"
                            }`}
                          >
                            <p className="mb-1 text-xs text-white/70">
                              {
                                message.sender
                                  ?.name
                              }
                            </p>

                            {message.type ===
                            "text" ? (
                              <p className="whitespace-pre-wrap wrap-break-word text-sm">
                                {
                                  message.payload
                                    .text
                                }
                              </p>
                            ) : null}

                            {message.type ===
                              "photo" &&
                            message.payload
                              .dataUrl ? (
                              <img
                                src={
                                  message.payload
                                    .dataUrl
                                }
                                alt={
                                  message.payload
                                    .fileName ||
                                  "Shared photo"
                                }
                                className="max-h-72 rounded object-contain"
                              />
                            ) : null}

                            {message.type ===
                              "voice" &&
                            message.payload
                              .dataUrl ? (
                              <audio
                                controls
                                src={
                                  message.payload
                                    .dataUrl
                                }
                                className="w-64 max-w-full"
                              />
                            ) : null}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="border-t border-gray-800 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={text}
                      onChange={(event) =>
                        setText(
                          event.target
                            .value
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                          "Enter"
                        ) {
                          sendText();
                        }
                      }}
                      placeholder="Write a message"
                      className="min-w-55 flex-1 rounded border border-gray-700 bg-[#0b0f19] px-3 py-2 outline-none focus:border-indigo-400"
                    />

                    <label className="cursor-pointer rounded bg-white/10 px-4 py-2 hover:bg-white/20">
                      Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={
                          sendPhoto
                        }
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={
                        isRecording
                          ? stopRecording
                          : startRecording
                      }
                      className="rounded bg-white/10 px-4 py-2 hover:bg-white/20"
                    >
                      {isRecording
                        ? "Stop Voice"
                        : "Voice"}
                    </button>

                    <button
                      onClick={sendText}
                      className="rounded bg-indigo-600 px-5 py-2 hover:bg-indigo-700"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-gray-400">
                Search a user or select a conversation.
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
