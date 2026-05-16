import { Server } from "socket.io";

import { AuthenticatedSocket } from "../types/socket.types";

export const registerMeetingSocket =
  (
    io: Server,
    socket: AuthenticatedSocket
  ) => {
    /* ==========================
       JOIN MEETING ROOM
    ========================== */

    socket.on(
      "join-meeting",
      (
        meetingId: string
      ) => {
        try {
          if (!meetingId) {
            console.log(
              "Invalid meeting id"
            );

            return;
          }

          socket.join(meetingId);

          console.log(
            `${socket.user?.name} joined ${meetingId}`
          );

          socket
            .to(meetingId)
            .emit(
              "user-joined",
              {
                userId:
                  socket.user?._id,

                name:
                  socket.user?.name,
              }
            );
        } catch (error) {
          console.log(error);
        }
      }
    );

    /* ==========================
       LEAVE ROOM
    ========================== */

    socket.on(
      "leave-meeting",
      (
        meetingId: string
      ) => {
        try {
          socket.leave(meetingId);

          socket
            .to(meetingId)
            .emit(
              "user-left",
              {
                userId:
                  socket.user?._id,
              }
            );
        } catch (error) {
          console.log(error);
        }
      }
    );
  };