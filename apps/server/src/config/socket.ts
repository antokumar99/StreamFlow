import http from "http";

import { Server } from "socket.io";

import app from "../app";

import { socketAuthMiddleware } from "../middlewares/socket.middleware";

import { registerChatSocket } from "../sockets/chat.socket";

import { registerMeetingSocket } from "../sockets/meeting.socket";

import { registerSignalingSocket } from "../sockets/signaling.socket";

const server = http.createServer(app);

/* =========================================
   SOCKET.IO SERVER
========================================= */

const io = new Server(server, {
  cors: {
    origin:
      process.env.CLIENT_URL,

    credentials: true,
  },

  transports: [
    "websocket",
    "polling",
  ],

  pingTimeout: 60000,

  pingInterval: 25000,
});

/* =========================================
   SOCKET AUTH MIDDLEWARE
========================================= */

io.use(socketAuthMiddleware);

/* =========================================
   SOCKET CONNECTION
========================================= */

io.on(
  "connection",
  (socket: any) => {
    console.log(
      `✅ Socket connected: ${socket.user?.name}`
    );

    console.log(
      `Socket ID: ${socket.id}`
    );

    /* =====================================
       REGISTER SOCKET MODULES
    ===================================== */

    registerMeetingSocket(
      io,
      socket
    );

    registerChatSocket(
      io,
      socket
    );

    registerSignalingSocket(
      io,
      socket
    );

    /* =====================================
       SOCKET ERRORS
    ===================================== */

    socket.on(
      "connect_error",
      (err: any) => {
        console.log(
          "Socket connect error:",
          err.message
        );
      }
    );

    socket.on(
      "error",
      (err: any) => {
        console.log(
          "Socket error:",
          err
        );
      }
    );

    /* =====================================
       DISCONNECT
    ===================================== */

    socket.on(
      "disconnect",
      (reason: string) => {
        console.log(
          `❌ Socket disconnected: ${socket.user?.name}`
        );

        console.log(
          `Reason: ${reason}`
        );
      }
    );
  }
);

export { io };

export default server;