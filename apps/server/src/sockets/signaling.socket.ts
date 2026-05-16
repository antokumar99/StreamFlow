import { Server } from "socket.io";

import { AuthenticatedSocket } from "../types/socket.types";

export const registerSignalingSocket =
  (
    io: Server,
    socket: AuthenticatedSocket
  ) => {
    /* ==========================
       WEBRTC OFFER
    ========================== */

    socket.on(
      "offer",
      ({
        meetingId,
        offer,
      }) => {
        socket
          .to(meetingId)
          .emit(
            "offer",
            {
              offer,
              sender:
                socket.user,
            }
          );
      }
    );

    /* ==========================
       WEBRTC ANSWER
    ========================== */

    socket.on(
      "answer",
      ({
        meetingId,
        answer,
      }) => {
        socket
          .to(meetingId)
          .emit(
            "answer",
            {
              answer,
              sender:
                socket.user,
            }
          );
      }
    );

    /* ==========================
       ICE CANDIDATE
    ========================== */

    socket.on(
      "ice-candidate",
      ({
        meetingId,
        candidate,
      }) => {
        socket
          .to(meetingId)
          .emit(
            "ice-candidate",
            {
              candidate,
              sender:
                socket.user,
            }
          );
      }
    );
  };