import { Server } from "socket.io";

import { AuthenticatedSocket } from "../types/socket.types";

export const registerChatSocket =
  (
    io: Server,
    socket: AuthenticatedSocket
  ) => {
    socket.on(
      "send-message",
      ({
        meetingId,
        message,
      }) => {
        io.to(meetingId).emit(
          "receive-message",
          {
            sender:
              socket.user?.name,

            message,

            createdAt:
              new Date(),
          }
        );
      }
    );
  };