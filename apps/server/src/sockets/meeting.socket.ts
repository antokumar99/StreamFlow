import { Server } from "socket.io";

import Meeting from "../models/Meeting.model";

import { AuthenticatedSocket } from "../types/socket.types";

interface MeetingParticipant {
  socketId: string;
  userId?: string;
  name?: string;
}

const rooms: Record<string, MeetingParticipant[]> = {};

const removeParticipantFromRoom = (
  io: Server,
  socket: AuthenticatedSocket,
  roomId: string
) => {
  const room = rooms[roomId];

  if (!room) return;

  const participantExists = room.some(
    (participant) => participant.socketId === socket.id
  );

  if (!participantExists) return;

  rooms[roomId] = room.filter(
    (participant) => participant.socketId !== socket.id
  );

  socket.leave(roomId);

  socket.to(roomId).emit(
    "user-left",
    socket.id
  );

  io.to(roomId).emit(
    "participant-count",
    rooms[roomId].length
  );

  if (rooms[roomId].length === 0) {
    delete rooms[roomId];

    Meeting.findOneAndUpdate(
      {
        roomId,
      },
      {
        $set: {
          isActive: false,
          participantCount: 0,
          endedAt: new Date(),
        },
      }
    ).catch((error) => {
      console.error(
        "Failed to end meeting:",
        error
      );
    });

    return;
  }

  Meeting.findOneAndUpdate(
    {
      roomId,
    },
    {
      $set: {
        participantCount:
          rooms[roomId].length,
      },
    }
  ).catch((error) => {
    console.error(
      "Failed to update meeting participant count:",
      error
    );
  });
};

export const registerMeetingSocket =
  (
    io: Server,
    socket: AuthenticatedSocket
  ) => {
    /* =========================
       JOIN ROOM
    ========================= */

    socket.on(
      "join-meeting",
      async (
        roomId: string
      ) => {
        if (!roomId) return;

        console.log(
          `${socket.user?.name} joined ${roomId}`
        );

        /* ======================
           ROOM INIT
        ====================== */

        if (!rooms[roomId]) {
          rooms[roomId] = [];
        }

        const existingParticipants =
          rooms[roomId].filter(
            (participant) =>
              participant.socketId !==
              socket.id
          );

        const alreadyInRoom =
          rooms[roomId].some(
            (participant) =>
              participant.socketId ===
              socket.id
          );

        if (alreadyInRoom) {
          socket.emit(
            "existing-participants",
            existingParticipants
          );

          return;
        }

        socket.join(roomId);

        /* ======================
           ADD USER
        ====================== */

        rooms[roomId].push({
          socketId: socket.id,

          userId:
            socket.user?._id,

          name:
            socket.user?.name,
        });

        try {
          await Meeting.findOneAndUpdate(
            {
              roomId,
            },
            {
              $set: {
                isActive: true,
                endedAt: null,
                participantCount:
                  rooms[roomId].length,
              },

              $setOnInsert: {
                roomId,
                hostId:
                  socket.user?._id,
                startedAt:
                  new Date(),
              },

              $addToSet: {
                participants:
                  socket.user?._id,
              },
            },
            {
              upsert: true,
              new: true,
              setDefaultsOnInsert: true,
            }
          );
        } catch (error) {
          console.error(
            "Failed to save meeting:",
            error
          );
        }

        /* ======================
           SEND EXISTING USERS
        ====================== */

        socket.emit(
          "existing-participants",
          existingParticipants
        );

        /* ======================
           NOTIFY OTHERS
        ====================== */

        socket
          .to(roomId)
          .emit(
            "user-joined",
            {
              socketId:
                socket.id,

              userId:
                socket.user?._id,

              name:
                socket.user?.name,
            }
          );

        /* ======================
           PARTICIPANT COUNT
        ====================== */

        io.to(roomId).emit(
          "participant-count",
          rooms[roomId].length
        );
      }
    );

    /* =========================
       LEAVE ROOM
    ========================= */

    socket.on(
      "leave-meeting",
      (roomId: string) => {
        if (!roomId) return;

        removeParticipantFromRoom(
          io,
          socket,
          roomId
        );
      }
    );

    /* =========================
       DISCONNECT
    ========================= */

    socket.on(
      "disconnect",
      () => {
        for (const roomId of Object.keys(rooms)) {
          removeParticipantFromRoom(
            io,
            socket,
            roomId
          );
        }

        console.log(
          "User disconnected"
        );
      }
    );
  };
