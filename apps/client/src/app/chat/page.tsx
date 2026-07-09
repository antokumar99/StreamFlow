"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";

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

interface LastMessagePreview {
  preview: string;
  senderId: string;
  senderName: string;
  createdAt: string;
}

interface Conversation {
  _id: string;
  name?: string;
  type: "direct" | "group";
  members: User[];
  lastMessageAt?: string;
  lastMessage?: LastMessagePreview | null;
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
  readBy?: string[];
  deliveredTo?: string[];
  editedAt?: string | null;
  isDeleted?: boolean;
  createdAt: string;
  clientTempId?: string;
  pending?: boolean;
  failed?: boolean;
}

type MessageStatus =
  | "sending"
  | "failed"
  | "sent"
  | "delivered"
  | "seen";

const readFileAsDataUrl = (file: File) =>
  new Promise<string>(
    (resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () =>
        resolve(String(reader.result));

      reader.onerror = reject;

      reader.readAsDataURL(file);
    }
  );

const formatMessageTime = (
  value: string
) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const formatSidebarTime = (
  value?: string
) => {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();

  if (
    date.toDateString() ===
    now.toDateString()
  ) {
    return formatMessageTime(value);
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
    }
  ).format(date);
};

const formatDayLabel = (
  value: string
) => {
  const date = new Date(value);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (
    date.toDateString() ===
    now.toDateString()
  ) {
    return "Today";
  }

  if (
    date.toDateString() ===
    yesterday.toDateString()
  ) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
    }
  ).format(date);
};

const getInitials = (name = "?") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const getMessageStatus = (
  message: ChatMessage,
  conversation: Conversation | null,
  myId?: string
): MessageStatus => {
  if (message.failed) return "failed";
  if (message.pending)
    return "sending";

  if (!conversation || !myId) {
    return "sent";
  }

  const others =
    conversation.members.filter(
      (member) => member._id !== myId
    );

  if (others.length === 0) {
    return "sent";
  }

  const readSet = new Set(
    (message.readBy || []).map(String)
  );
  const deliveredSet = new Set(
    (message.deliveredTo || []).map(
      String
    )
  );

  if (
    others.every((member) =>
      readSet.has(member._id)
    )
  ) {
    return "seen";
  }

  if (
    others.some(
      (member) =>
        deliveredSet.has(member._id) ||
        readSet.has(member._id)
    )
  ) {
    return "delivered";
  }

  return "sent";
};

function StatusTicks({
  status,
}: {
  status: MessageStatus;
}) {
  if (status === "sending") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    );
  }

  if (status === "failed") {
    return (
      <span className="text-xs text-red-300">
        Failed
      </span>
    );
  }

  if (status === "sent") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    );
  }

  const seen = status === "seen";

  return (
    <svg width="17" height="14" viewBox="0 0 28 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={seen ? "text-sky-300" : "text-white/60"}>
      <path d="M16 6L5 17l-4-4" />
      <path d="M27 6L16 17l-1.5-1.5" />
    </svg>
  );
}

export default function ChatPage() {
  const { user } = useAuthStore();

  const [conversations, setConversations] =
    useState<Conversation[]>([]);
  const [
    activeConversation,
    setActiveConversation,
  ] = useState<Conversation | null>(
    null
  );
  const [messages, setMessages] =
    useState<ChatMessage[]>([]);
  const [search, setSearch] =
    useState("");
  const [users, setUsers] = useState<
    User[]
  >([]);
  const [
    selectedGroupUsers,
    setSelectedGroupUsers,
  ] = useState<User[]>([]);
  const [groupName, setGroupName] =
    useState("");
  const [groupOpen, setGroupOpen] =
    useState(false);
  const [text, setText] = useState("");
  const [notice, setNotice] =
    useState("");
  const [isRecording, setIsRecording] =
    useState(false);
  const [editingMessage, setEditingMessage] =
    useState<ChatMessage | null>(null);
  const [menuMessageId, setMenuMessageId] =
    useState<string | null>(null);
  const [unreadIds, setUnreadIds] =
    useState<Set<string>>(new Set());
  const [typingName, setTypingName] =
    useState("");

  const recorderRef =
    useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef =
    useRef(0);
  const activeIdRef = useRef<
    string | null
  >(null);
  const bottomRef =
    useRef<HTMLDivElement | null>(null);
  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );
  const typingSentAtRef = useRef(0);
  const typingClearRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const activeConversationId =
    activeConversation?._id || null;

  useEffect(() => {
    activeIdRef.current =
      activeConversationId;
  }, [activeConversationId]);

  const currentMessages = useMemo(
    () =>
      messages.filter(
        (message) =>
          message.conversationId ===
          activeConversationId
      ),
    [messages, activeConversationId]
  );

  const showNotice = (value: string) => {
    setNotice(value);
    window.setTimeout(
      () => setNotice(""),
      4000
    );
  };

  const getConversationTitle = (
    conversation: Conversation
  ) => {
    if (conversation.type === "group") {
      return (
        conversation.name ||
        "Group chat"
      );
    }

    const otherMember =
      conversation.members.find(
        (member) =>
          member._id !== user?._id
      );

    return (
      otherMember?.name ||
      "Direct chat"
    );
  };

  const bumpConversation = (
    conversationId: string,
    preview: LastMessagePreview | null
  ) => {
    setConversations((current) => {
      const next = current.map(
        (conversation) =>
          conversation._id ===
          conversationId
            ? {
                ...conversation,
                lastMessageAt:
                  preview?.createdAt ||
                  conversation.lastMessageAt,
                lastMessage:
                  preview ||
                  conversation.lastMessage,
              }
            : conversation
      );

      return next.sort(
        (a, b) =>
          new Date(
            b.lastMessageAt || 0
          ).getTime() -
          new Date(
            a.lastMessageAt || 0
          ).getTime()
      );
    });
  };

  const previewFromMessage = (
    message: ChatMessage
  ): LastMessagePreview => ({
    preview: message.isDeleted
      ? "Message deleted"
      : message.type === "photo"
        ? "📷 Photo"
        : message.type === "voice"
          ? "🎤 Voice message"
          : (
              message.payload.text || ""
            ).slice(0, 80),
    senderId: String(
      message.sender?._id
    ),
    senderName:
      message.sender?.name || "",
    createdAt: message.createdAt,
  });

  /* ---------- initial data ---------- */

  useEffect(() => {
    const loadConversations =
      async () => {
        try {
          const response =
            await api.get(
              "/chats/conversations"
            );

          setConversations(
            response.data
              .conversations || []
          );
        } catch (error) {
          console.error(error);
        }
      };

    loadConversations();
  }, []);

  useEffect(() => {
    if (search.trim().length < 2) {
      return;
    }

    const timeoutId = window.setTimeout(
      async () => {
        const response = await api.get(
          "/chats/users",
          {
            params: { q: search },
          }
        );

        setUsers(
          response.data.users || []
        );
      },
      250
    );

    return () =>
      window.clearTimeout(timeoutId);
  }, [search]);

  const visibleUsers =
    search.trim().length < 2
      ? []
      : users;

  /* ---------- socket wiring ---------- */

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleMessage = (
      message: ChatMessage
    ) => {
      setMessages((current) => {
        // Replace the optimistic copy once the server confirms.
        if (message.clientTempId) {
          const tempIndex =
            current.findIndex(
              (item) =>
                item._id ===
                message.clientTempId
            );

          if (tempIndex !== -1) {
            const next = [...current];
            next[tempIndex] = message;
            return next;
          }
        }

        if (
          current.some(
            (item) =>
              item._id === message._id
          )
        ) {
          return current;
        }

        return [...current, message];
      });

      bumpConversation(
        String(message.conversationId),
        previewFromMessage(message)
      );

      const isMine =
        String(message.sender?._id) ===
        String(user?._id);

      if (
        String(
          message.conversationId
        ) === activeIdRef.current
      ) {
        if (!isMine) {
          socket.emit(
            "mark-conversation-read",
            activeIdRef.current
          );
        }
      } else if (!isMine) {
        setUnreadIds((current) => {
          const next = new Set(current);
          next.add(
            String(
              message.conversationId
            )
          );
          return next;
        });
      }
    };

    const handleUpdated = (
      message: ChatMessage
    ) => {
      setMessages((current) =>
        current.map((item) =>
          item._id === message._id
            ? message
            : item
        )
      );
    };

    const handleDeleted = ({
      messageId,
      conversationId,
    }: {
      messageId: string;
      conversationId: string;
    }) => {
      setMessages((current) =>
        current.map((item) =>
          item._id === messageId
            ? {
                ...item,
                isDeleted: true,
                payload: {},
              }
            : item
        )
      );

      bumpConversation(
        conversationId,
        null
      );
    };

    const applyReceipt = (
      conversationId: string,
      userId: string,
      field:
        | "readBy"
        | "deliveredTo"
    ) => {
      setMessages((current) =>
        current.map((item) => {
          if (
            String(
              item.conversationId
            ) !== conversationId ||
            String(item.sender?._id) ===
              userId
          ) {
            return item;
          }

          const values = new Set(
            (item[field] || []).map(
              String
            )
          );

          if (values.has(userId)) {
            return item;
          }

          return {
            ...item,
            [field]: [
              ...(item[field] || []),
              userId,
            ],
          };
        })
      );
    };

    const handleRead = ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      applyReceipt(
        conversationId,
        userId,
        "readBy"
      );
      applyReceipt(
        conversationId,
        userId,
        "deliveredTo"
      );
    };

    const handleDelivered = ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      applyReceipt(
        conversationId,
        userId,
        "deliveredTo"
      );
    };

    const handleTyping = ({
      conversationId,
      name,
    }: {
      conversationId: string;
      name: string;
    }) => {
      if (
        conversationId !==
        activeIdRef.current
      ) {
        return;
      }

      setTypingName(name);

      if (typingClearRef.current) {
        clearTimeout(
          typingClearRef.current
        );
      }

      typingClearRef.current =
        setTimeout(
          () => setTypingName(""),
          3000
        );
    };

    const handleError = (
      message: string
    ) => {
      showNotice(message);
    };

    socket.on(
      "receive-chat-message",
      handleMessage
    );
    socket.on(
      "chat-message-updated",
      handleUpdated
    );
    socket.on(
      "chat-message-deleted",
      handleDeleted
    );
    socket.on(
      "conversation-read",
      handleRead
    );
    socket.on(
      "conversation-delivered",
      handleDelivered
    );
    socket.on(
      "chat-typing",
      handleTyping
    );
    socket.on(
      "chat-error",
      handleError
    );

    return () => {
      socket.off(
        "receive-chat-message",
        handleMessage
      );
      socket.off(
        "chat-message-updated",
        handleUpdated
      );
      socket.off(
        "chat-message-deleted",
        handleDeleted
      );
      socket.off(
        "conversation-read",
        handleRead
      );
      socket.off(
        "conversation-delivered",
        handleDelivered
      );
      socket.off(
        "chat-typing",
        handleTyping
      );
      socket.off(
        "chat-error",
        handleError
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  /* ---------- open a conversation ---------- */

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    setTypingName("");
    setEditingMessage(null);
    setMenuMessageId(null);

    setUnreadIds((current) => {
      if (
        !current.has(
          activeConversationId
        )
      ) {
        return current;
      }

      const next = new Set(current);
      next.delete(
        activeConversationId
      );
      return next;
    });

    const loadMessages = async () => {
      const response = await api.get(
        `/chats/conversations/${activeConversationId}/messages`
      );

      setMessages((current) => {
        const otherMessages =
          current.filter(
            (message) =>
              message.conversationId !==
              activeConversationId
          );

        return [
          ...otherMessages,
          ...(response.data.messages ||
            []),
        ];
      });

      socket.emit(
        "mark-conversation-read",
        activeConversationId
      );
    };

    socket.emit(
      "join-conversation",
      activeConversationId
    );

    loadMessages();
  }, [activeConversationId]);

  /* ---------- auto scroll ---------- */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [
    currentMessages.length,
    typingName,
    activeConversationId,
  ]);

  /* ---------- conversation actions ---------- */

  const startDirectChat = async (
    targetUser: User
  ) => {
    const response = await api.post(
      "/chats/conversations/direct",
      {
        userId: targetUser._id,
      }
    );

    const conversation =
      response.data.conversation;

    setConversations((current) => {
      const exists = current.some(
        (item) =>
          item._id === conversation._id
      );

      return exists
        ? current
        : [conversation, ...current];
    });

    setActiveConversation(
      conversation
    );
    setSearch("");
    setUsers([]);
  };

  const createGroup = async () => {
    if (
      !groupName.trim() ||
      selectedGroupUsers.length < 2
    ) {
      showNotice(
        "Add a group name and at least two users."
      );
      return;
    }

    const response = await api.post(
      "/chats/conversations/group",
      {
        name: groupName.trim(),
        memberIds:
          selectedGroupUsers.map(
            (member) => member._id
          ),
      }
    );

    const conversation =
      response.data.conversation;

    setConversations((current) => [
      conversation,
      ...current,
    ]);
    setActiveConversation(
      conversation
    );
    setSelectedGroupUsers([]);
    setGroupName("");
    setGroupOpen(false);
  };

  const closeConversation = () => {
    if (activeConversationId) {
      socket.emit(
        "leave-conversation",
        activeConversationId
      );
    }

    setActiveConversation(null);
  };

  /* ---------- sending ---------- */

  const sendMessage = (
    type: MessageType,
    payload: ChatMessage["payload"]
  ) => {
    if (
      !activeConversationId ||
      !user
    ) {
      showNotice(
        "Select a chat first."
      );
      return;
    }

    const clientTempId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const optimistic: ChatMessage = {
      _id: clientTempId,
      clientTempId,
      conversationId:
        activeConversationId,
      sender: user,
      type,
      payload,
      readBy: [user._id],
      deliveredTo: [],
      createdAt:
        new Date().toISOString(),
      pending: true,
    };

    setMessages((current) => [
      ...current,
      optimistic,
    ]);

    bumpConversation(
      activeConversationId,
      previewFromMessage(optimistic)
    );

    socket.emit("send-chat-message", {
      conversationId:
        activeConversationId,
      type,
      payload,
      clientTempId,
    });

    // If the server never confirms, surface the failure.
    window.setTimeout(() => {
      setMessages((current) =>
        current.map((item) =>
          item._id === clientTempId &&
          item.pending
            ? {
                ...item,
                pending: false,
                failed: true,
              }
            : item
        )
      );
    }, 10000);
  };

  const saveEdit = () => {
    const value = text.trim();

    if (!editingMessage || !value) {
      return;
    }

    socket.emit("edit-chat-message", {
      messageId: editingMessage._id,
      text: value,
    });

    setMessages((current) =>
      current.map((item) =>
        item._id === editingMessage._id
          ? {
              ...item,
              payload: { text: value },
              editedAt:
                new Date().toISOString(),
            }
          : item
      )
    );

    setEditingMessage(null);
    setText("");
  };

  const handleSubmit = (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (editingMessage) {
      saveEdit();
      return;
    }

    const value = text.trim();

    if (!value) return;

    sendMessage("text", {
      text: value,
    });

    setText("");
  };

  const handleTextChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setText(event.target.value);

    if (
      !activeConversationId ||
      editingMessage
    ) {
      return;
    }

    const now = Date.now();

    if (
      now - typingSentAtRef.current >
      1500
    ) {
      typingSentAtRef.current = now;
      socket.emit(
        "chat-typing",
        activeConversationId
      );
    }
  };

  const startEditing = (
    message: ChatMessage
  ) => {
    setEditingMessage(message);
    setText(
      message.payload.text || ""
    );
    setMenuMessageId(null);
    inputRef.current?.focus();
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setText("");
  };

  const deleteMessage = (
    message: ChatMessage
  ) => {
    setMenuMessageId(null);

    if (message.pending) return;

    socket.emit(
      "delete-chat-message",
      {
        messageId: message._id,
      }
    );

    setMessages((current) =>
      current.map((item) =>
        item._id === message._id
          ? {
              ...item,
              isDeleted: true,
              payload: {},
            }
          : item
      )
    );
  };

  const sendPhoto = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const dataUrl =
      await readFileAsDataUrl(file);

    sendMessage("photo", {
      dataUrl,
      fileName: file.name,
      mimeType: file.type,
    });

    event.target.value = "";
  };

  const startRecording = async () => {
    try {
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

      recorder.ondataavailable = (
        event
      ) => {
        if (event.data.size > 0) {
          chunksRef.current.push(
            event.data
          );
        }
      };

      recorder.onstop = async () => {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        const blob = new Blob(
          chunksRef.current,
          {
            type: "audio/webm",
          }
        );

        const file = new File(
          [blob],
          "voice-message.webm",
          {
            type: "audio/webm",
          }
        );

        const dataUrl =
          await readFileAsDataUrl(
            file
          );

        sendMessage("voice", {
          dataUrl,
          fileName: file.name,
          mimeType: file.type,
          durationMs:
            Date.now() -
            recordingStartedAtRef.current,
        });
      };

      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      showNotice(
        "Microphone is unavailable."
      );
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setIsRecording(false);
  };

  const toggleGroupUser = (
    targetUser: User
  ) => {
    setSelectedGroupUsers((current) =>
      current.some(
        (member) =>
          member._id === targetUser._id
      )
        ? current.filter(
            (member) =>
              member._id !==
              targetUser._id
          )
        : [...current, targetUser]
    );
  };

  /* ---------- render ---------- */

  const renderMessages = () => {
    const items: React.ReactNode[] = [];
    let lastDay = "";

    currentMessages.forEach(
      (message) => {
        const day = new Date(
          message.createdAt
        ).toDateString();

        if (day !== lastDay) {
          lastDay = day;

          items.push(
            <div
              key={`day-${day}`}
              className="my-4 flex items-center justify-center"
            >
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
                {formatDayLabel(
                  message.createdAt
                )}
              </span>
            </div>
          );
        }

        const isMine =
          String(
            message.sender?._id
          ) === String(user?._id);
        const isGroup =
          activeConversation?.type ===
          "group";
        const status = isMine
          ? getMessageStatus(
              message,
              activeConversation,
              user?._id
            )
          : null;
        const canEdit =
          isMine &&
          !message.isDeleted &&
          !message.pending &&
          !message.failed &&
          message.type === "text";
        const canDelete =
          isMine &&
          !message.isDeleted &&
          !message.pending;

        items.push(
          <div
            key={message._id}
            className={`group flex items-end gap-2 ${
              isMine
                ? "justify-end"
                : "justify-start"
            }`}
          >
            {!isMine && isGroup ? (
              <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-semibold text-indigo-200">
                {getInitials(
                  message.sender?.name
                )}
              </div>
            ) : null}

            {/* actions for my messages */}
            {isMine &&
            (canEdit || canDelete) ? (
              <div className="relative order-first self-center">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuMessageId(
                      (current) =>
                        current ===
                        message._id
                          ? null
                          : message._id
                    );
                  }}
                  aria-label="Message actions"
                  className="rounded-full p-1.5 text-gray-500 opacity-100 transition hover:bg-white/10 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>

                {menuMessageId ===
                message._id ? (
                  <div className="absolute right-0 top-8 z-20 w-32 overflow-hidden rounded-lg border border-gray-700 bg-[#1a2235] text-sm shadow-xl">
                    {canEdit ? (
                      <button
                        onClick={() =>
                          startEditing(
                            message
                          )
                        }
                        className="block w-full px-3 py-2 text-left hover:bg-white/10"
                      >
                        Edit
                      </button>
                    ) : null}
                    <button
                      onClick={() =>
                        deleteMessage(
                          message
                        )
                      }
                      className="block w-full px-3 py-2 text-left text-red-400 hover:bg-white/10"
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div
              className={[
                "max-w-[78%] rounded-2xl px-3.5 py-2 shadow-sm sm:max-w-[65%]",
                isMine
                  ? "rounded-br-md bg-gradient-to-br from-indigo-600 to-indigo-700"
                  : "rounded-bl-md bg-[#1e2738]",
              ].join(" ")}
            >
              {!isMine && isGroup ? (
                <p className="mb-0.5 text-xs font-semibold text-indigo-300">
                  {message.sender?.name}
                </p>
              ) : null}

              {message.isDeleted ? (
                <p className="text-sm italic text-white/50">
                  This message was
                  deleted
                </p>
              ) : (
                <>
                  {message.type ===
                  "text" ? (
                    <p className="whitespace-pre-wrap break-words text-sm">
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
                    <Image
                      src={
                        message.payload
                          .dataUrl
                      }
                      alt={
                        message.payload
                          .fileName ||
                        "Shared photo"
                      }
                      width={420}
                      height={280}
                      unoptimized
                      className="max-h-72 w-auto rounded-lg object-contain"
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
                </>
              )}

              <div
                className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] ${
                  isMine
                    ? "text-white/60"
                    : "text-gray-500"
                }`}
              >
                {message.editedAt &&
                !message.isDeleted ? (
                  <span>edited</span>
                ) : null}

                <span>
                  {formatMessageTime(
                    message.createdAt
                  )}
                </span>

                {status ? (
                  <StatusTicks
                    status={status}
                  />
                ) : null}
              </div>
            </div>
          </div>
        );
      }
    );

    return items;
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col bg-[#0b0f19] p-3 text-white sm:p-5">
        {notice ? (
          <div className="fixed right-4 top-4 z-50 rounded-xl border border-gray-700 bg-[#1a2235] px-4 py-3 text-sm shadow-2xl">
            {notice}
          </div>
        ) : null}

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
          {/* ------- sidebar ------- */}
          <aside
            className={[
              "min-h-0 flex-col rounded-xl border border-gray-800 bg-[#111827]",
              activeConversation
                ? "hidden lg:flex"
                : "flex",
            ].join(" ")}
          >
            <div className="border-b border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link
                    href="/dashboard"
                    aria-label="Back to dashboard"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-800 bg-[#0b0f19] text-gray-400 hover:text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </Link>

                  <h1 className="text-xl font-bold">
                    Messages
                  </h1>
                </div>

                <button
                  onClick={() =>
                    setGroupOpen(
                      (current) =>
                        !current
                    )
                  }
                  className={[
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                    groupOpen
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-700 text-gray-300 hover:text-white",
                  ].join(" ")}
                >
                  New group
                </button>
              </div>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search people to chat"
                className="mt-3 w-full rounded-xl border border-gray-700 bg-[#0b0f19] px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />

              {visibleUsers.length >
              0 ? (
                <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-gray-800">
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
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-200">
                            {getInitials(
                              item.name
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {item.name}
                            </p>
                            <p className="truncate text-xs text-gray-400">
                              {
                                item.email
                              }
                            </p>
                          </div>
                        </button>

                        {groupOpen ? (
                          <button
                            onClick={() =>
                              toggleGroupUser(
                                item
                              )
                            }
                            className={[
                              "shrink-0 rounded-lg px-2 py-1 text-xs",
                              selectedGroupUsers.some(
                                (
                                  member
                                ) =>
                                  member._id ===
                                  item._id
                              )
                                ? "bg-indigo-600"
                                : "bg-white/10 hover:bg-white/20",
                            ].join(" ")}
                          >
                            {selectedGroupUsers.some(
                              (member) =>
                                member._id ===
                                item._id
                            )
                              ? "Added"
                              : "Add"}
                          </button>
                        ) : null}
                      </div>
                    )
                  )}
                </div>
              ) : null}

              {groupOpen ? (
                <div className="mt-3 rounded-lg border border-gray-800 p-3">
                  <input
                    value={groupName}
                    onChange={(event) =>
                      setGroupName(
                        event.target
                          .value
                      )
                    }
                    placeholder="Group name"
                    className="w-full rounded-lg border border-gray-700 bg-[#0b0f19] px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    {
                      selectedGroupUsers.length
                    }{" "}
                    member
                    {selectedGroupUsers.length ===
                    1
                      ? ""
                      : "s"}{" "}
                    selected — search
                    above to add people
                  </p>

                  <button
                    onClick={createGroup}
                    className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500"
                  >
                    Create Group
                  </button>
                </div>
              ) : null}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {conversations.length ===
              0 ? (
                <p className="px-2 py-6 text-center text-sm text-gray-500">
                  No conversations yet.
                  Search for someone to
                  start chatting.
                </p>
              ) : (
                conversations.map(
                  (conversation) => {
                    const hasUnread =
                      unreadIds.has(
                        conversation._id
                      );
                    const preview =
                      conversation.lastMessage;

                    return (
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
                          "mb-1.5 flex w-full items-center gap-3 rounded-xl p-3 text-left transition",
                          activeConversationId ===
                          conversation._id
                            ? "bg-indigo-500/15"
                            : "hover:bg-white/5",
                        ].join(" ")}
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-200">
                          {getInitials(
                            getConversationTitle(
                              conversation
                            )
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`truncate ${
                                hasUnread
                                  ? "font-bold"
                                  : "font-medium"
                              }`}
                            >
                              {getConversationTitle(
                                conversation
                              )}
                            </p>
                            <span className="shrink-0 text-[10px] text-gray-500">
                              {formatSidebarTime(
                                preview?.createdAt ||
                                  conversation.lastMessageAt
                              )}
                            </span>
                          </div>

                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <p
                              className={`truncate text-xs ${
                                hasUnread
                                  ? "font-semibold text-gray-200"
                                  : "text-gray-400"
                              }`}
                            >
                              {preview
                                ? `${
                                    preview.senderId ===
                                    user?._id
                                      ? "You: "
                                      : conversation.type ===
                                          "group"
                                        ? `${preview.senderName.split(" ")[0]}: `
                                        : ""
                                  }${preview.preview}`
                                : conversation.type ===
                                    "group"
                                  ? `${conversation.members.length} members`
                                  : "Say hello 👋"}
                            </p>

                            {hasUnread ? (
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500" />
                            ) : null}
                          </div>
                        </div>
                      </button>
                    );
                  }
                )
              )}
            </div>
          </aside>

          {/* ------- conversation ------- */}
          <main
            className={[
              "min-h-0 flex-col rounded-xl border border-gray-800 bg-[#111827]",
              activeConversation
                ? "flex"
                : "hidden lg:flex",
            ].join(" ")}
          >
            {activeConversation ? (
              <>
                <div className="flex items-center gap-3 border-b border-gray-800 p-3 sm:p-4">
                  <button
                    onClick={
                      closeConversation
                    }
                    aria-label="Back to conversations"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white lg:hidden"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 font-semibold text-emerald-100">
                    {getInitials(
                      getConversationTitle(
                        activeConversation
                      )
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold">
                      {getConversationTitle(
                        activeConversation
                      )}
                    </h2>
                    <p className="truncate text-xs text-gray-400">
                      {typingName ? (
                        <span className="text-indigo-300">
                          {typingName} is
                          typing…
                        </span>
                      ) : (
                        activeConversation.members
                          .map(
                            (member) =>
                              member.name
                          )
                          .join(", ")
                      )}
                    </p>
                  </div>
                </div>

                <div
                  className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 sm:p-4"
                  onClick={() =>
                    setMenuMessageId(
                      null
                    )
                  }
                >
                  {currentMessages.length ===
                  0 ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-gray-500">
                        No messages yet —
                        say hello 👋
                      </p>
                    </div>
                  ) : (
                    renderMessages()
                  )}
                  <div
                    ref={bottomRef}
                  />
                </div>

                {editingMessage ? (
                  <div className="flex items-center justify-between gap-3 border-t border-gray-800 bg-indigo-500/10 px-4 py-2 text-sm">
                    <span className="text-indigo-300">
                      Editing message
                    </span>
                    <button
                      onClick={
                        cancelEditing
                      }
                      className="text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : null}

                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-2 border-t border-gray-800 p-3"
                >
                  <label
                    aria-label="Send a photo"
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={sendPhoto}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={
                      isRecording
                        ? stopRecording
                        : startRecording
                    }
                    aria-label={
                      isRecording
                        ? "Stop recording"
                        : "Record voice message"
                    }
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition",
                      isRecording
                        ? "animate-pulse bg-red-600 text-white"
                        : "text-gray-400 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                    </svg>
                  </button>

                  <input
                    ref={inputRef}
                    value={text}
                    onChange={
                      handleTextChange
                    }
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                          "Escape" &&
                        editingMessage
                      ) {
                        cancelEditing();
                      }
                    }}
                    placeholder={
                      editingMessage
                        ? "Edit your message"
                        : "Write a message"
                    }
                    className="min-w-0 flex-1 rounded-full border border-gray-700 bg-[#0b0f19] px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
                  />

                  <button
                    type="submit"
                    aria-label={
                      editingMessage
                        ? "Save edit"
                        : "Send message"
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-500"
                  >
                    {editingMessage ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                      </svg>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-400">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p>
                  Select a conversation
                  or search for someone.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
