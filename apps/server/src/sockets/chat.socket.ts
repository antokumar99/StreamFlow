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
  payload: {
    text?: string;
    dataUrl?: string;
    fileName?: string;
    mimeType?: string;
    durationMs?: number;
  };
}

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

        if (conversation) {
          socket.join(
            `conversation:${conversationId}`
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
              readBy: [
                socket.user?._id,
              ],
            });

          conversation.lastMessageAt =
            new Date();
          await conversation.save();

          const serialized =
            await serializeMessage(
              message
            );

          io.to(
            `conversation:${conversationId}`
          ).emit(
            "receive-chat-message",
            serialized
          );

          const recipients =
            conversation.members.filter(
              (memberId) =>
                memberId.toString() !==
                socket.user?._id.toString()
            );

          await Promise.all(
            recipients.map(
              async (recipientId) => {
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

                io.to(
                  `user:${recipientId.toString()}`
                ).emit(
                  "receive-chat-message",
                  serialized
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
