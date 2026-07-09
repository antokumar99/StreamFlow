import { Server } from "socket.io";

import Conversation from "../models/Conversation.model";
import Message, { MessageType } from "../models/Message.model";
import Notification from "../models/Notification.model";
import { AuthenticatedSocket } from "../types/socket.types";
import { serializeMessage } from "../controllers/chat.controller";
import { encryptPayload } from "../utils/messageCrypto";

interface SendChatMessagePayload {
  conversationId: string;
  type: MessageType;
  clientTempId?: string;
  payload: {
    text?: string;
    dataUrl?: string;
    fileName?: string;
    mimeType?: string;
    durationMs?: number;
  };
}

/* User ids that currently have this conversation open. */
const getViewerIds = (
  io: Server,
  conversationId: string
) => {
  const viewerIds = new Set<string>();
  const room =
    io.sockets.adapter.rooms.get(
      `conversation:${conversationId}`
    );

  room?.forEach((socketId) => {
    const memberSocket =
      io.sockets.sockets.get(
        socketId
      ) as
        | AuthenticatedSocket
        | undefined;

    if (memberSocket?.user?._id) {
      viewerIds.add(
        String(memberSocket.user._id)
      );
    }
  });

  return viewerIds;
};

const isUserOnline = (
  io: Server,
  userId: string
) =>
  (io.sockets.adapter.rooms.get(
    `user:${userId}`
  )?.size ?? 0) > 0;

const emitToMembers = (
  io: Server,
  memberIds: unknown[],
  event: string,
  payload: unknown
) => {
  memberIds.forEach((memberId) => {
    io.to(
      `user:${String(memberId)}`
    ).emit(event, payload);
  });
};

export const registerChatSocket =
  (
    io: Server,
    socket: AuthenticatedSocket
  ) => {
    const userRoom =
      `user:${socket.user?._id}`;

    socket.join(userRoom);

    socket.on(
      "join-conversation",
      async (
        conversationId: string
      ) => {
        const conversation =
          await Conversation.findOne({
            _id: conversationId,
            members:
              socket.user?._id,
          });

        if (!conversation) return;

        // A socket views one conversation at a time; leaving the
        // previous room keeps "viewer" checks accurate.
        for (const room of socket.rooms) {
          if (
            room.startsWith(
              "conversation:"
            )
          ) {
            socket.leave(room);
          }
        }

        socket.join(
          `conversation:${conversationId}`
        );
      }
    );

    socket.on(
      "leave-conversation",
      (conversationId: string) => {
        if (!conversationId) return;

        socket.leave(
          `conversation:${conversationId}`
        );
      }
    );

    socket.on(
      "chat-typing",
      (conversationId: string) => {
        if (!conversationId) return;

        socket
          .to(
            `conversation:${conversationId}`
          )
          .emit("chat-typing", {
            conversationId,
            userId: String(
              socket.user?._id
            ),
            name:
              socket.user?.name ||
              "Someone",
          });
      }
    );

    socket.on(
      "mark-conversation-read",
      async (
        conversationId: string
      ) => {
        try {
          const conversation =
            await Conversation.findOne({
              _id: conversationId,
              members:
                socket.user?._id,
            });

          if (!conversation) return;

          const updated =
            await Message.updateMany(
              {
                conversationId:
                  conversation._id,
                senderId: {
                  $ne: socket.user?._id,
                },
                readBy: {
                  $ne: socket.user?._id,
                },
              },
              {
                $addToSet: {
                  readBy:
                    socket.user?._id,
                  deliveredTo:
                    socket.user?._id,
                },
              }
            );

          if (
            updated.modifiedCount === 0
          ) {
            return;
          }

          const payload = {
            conversationId: String(
              conversation._id
            ),
            userId: String(
              socket.user?._id
            ),
          };

          io.to(
            `conversation:${conversation._id}`
          ).emit(
            "conversation-read",
            payload
          );

          emitToMembers(
            io,
            conversation.members,
            "conversation-read",
            payload
          );
        } catch (error) {
          console.error(error);
        }
      }
    );

    socket.on(
      "edit-chat-message",
      async ({
        messageId,
        text,
      }: {
        messageId: string;
        text: string;
      }) => {
        try {
          const value = String(
            text || ""
          ).trim();

          if (!messageId || !value) {
            return;
          }

          const message =
            await Message.findOne({
              _id: messageId,
              senderId:
                socket.user?._id,
              isDeleted: {
                $ne: true,
              },
            });

          if (
            !message ||
            message.type !== "text"
          ) {
            socket.emit(
              "chat-error",
              "This message cannot be edited"
            );

            return;
          }

          const encrypted =
            encryptPayload({
              text: value,
            });

          message.encryptedPayload =
            encrypted.encryptedPayload;
          message.iv = encrypted.iv;
          message.authTag =
            encrypted.authTag;
          message.editedAt =
            new Date();

          await message.save();

          const serialized =
            await serializeMessage(
              message
            );

          io.to(
            `conversation:${message.conversationId}`
          ).emit(
            "chat-message-updated",
            serialized
          );

          const conversation =
            await Conversation.findById(
              message.conversationId
            ).select("members");

          if (conversation) {
            emitToMembers(
              io,
              conversation.members,
              "chat-message-updated",
              serialized
            );
          }
        } catch (error) {
          console.error(error);

          socket.emit(
            "chat-error",
            "Failed to edit message"
          );
        }
      }
    );

    socket.on(
      "delete-chat-message",
      async ({
        messageId,
      }: {
        messageId: string;
      }) => {
        try {
          if (!messageId) return;

          const message =
            await Message.findOne({
              _id: messageId,
              senderId:
                socket.user?._id,
            });

          if (!message) {
            socket.emit(
              "chat-error",
              "This message cannot be deleted"
            );

            return;
          }

          message.isDeleted = true;
          await message.save();

          const payload = {
            messageId: String(
              message._id
            ),
            conversationId: String(
              message.conversationId
            ),
          };

          io.to(
            `conversation:${message.conversationId}`
          ).emit(
            "chat-message-deleted",
            payload
          );

          const conversation =
            await Conversation.findById(
              message.conversationId
            ).select("members");

          if (conversation) {
            emitToMembers(
              io,
              conversation.members,
              "chat-message-deleted",
              payload
            );
          }
        } catch (error) {
          console.error(error);

          socket.emit(
            "chat-error",
            "Failed to delete message"
          );
        }
      }
    );

    socket.on(
      "send-chat-message",
      async ({
        conversationId,
        type,
        payload,
        clientTempId,
      }: SendChatMessagePayload) => {
        try {
          const conversation =
            await Conversation.findOne({
              _id: conversationId,
              members:
                socket.user?._id,
            });

          if (!conversation) {
            socket.emit(
              "chat-error",
              "Conversation not found"
            );

            return;
          }

          if (
            ![
              "text",
              "photo",
              "voice",
            ].includes(type)
          ) {
            socket.emit(
              "chat-error",
              "Unsupported message type"
            );

            return;
          }

          const senderId = String(
            socket.user?._id
          );

          const recipients =
            conversation.members.filter(
              (memberId) =>
                memberId.toString() !==
                senderId
            );

          const viewerIds =
            getViewerIds(
              io,
              String(conversation._id)
            );

          // Viewers see the message immediately (read); other
          // online users have it delivered to their client.
          const deliveredTo =
            recipients.filter(
              (recipientId) =>
                viewerIds.has(
                  recipientId.toString()
                ) ||
                isUserOnline(
                  io,
                  recipientId.toString()
                )
            );

          const readBy = [
            socket.user?._id,
            ...recipients.filter(
              (recipientId) =>
                viewerIds.has(
                  recipientId.toString()
                )
            ),
          ];

          const encrypted =
            encryptPayload(payload);

          const message =
            await Message.create({
              conversationId:
                conversation._id,
              senderId:
                socket.user?._id,
              type,
              ...encrypted,
              readBy,
              deliveredTo,
            });

          conversation.lastMessageAt =
            new Date();
          await conversation.save();

          const serialized = {
            ...(await serializeMessage(
              message
            )),
            clientTempId,
          };

          io.to(
            `conversation:${conversationId}`
          ).emit(
            "receive-chat-message",
            serialized
          );

          await Promise.all(
            recipients.map(
              async (recipientId) => {
                io.to(
                  `user:${recipientId.toString()}`
                ).emit(
                  "receive-chat-message",
                  serialized
                );

                // People with the conversation open don't need
                // a notification for it.
                if (
                  viewerIds.has(
                    recipientId.toString()
                  )
                ) {
                  return;
                }

                const notification =
                  await Notification.create({
                    userId: recipientId,
                    title:
                      "New message",
                    message:
                      `${socket.user?.name} sent you a ${type} message`,
                    type: "message",
                  });

                io.to(
                  `user:${recipientId.toString()}`
                ).emit(
                  "notification",
                  notification
                );
              }
            )
          );
        } catch (error) {
          console.error(error);

          socket.emit(
            "chat-error",
            "Failed to send message"
          );
        }
      }
    );
  };
