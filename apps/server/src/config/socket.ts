import http from "http";
import { Server } from "socket.io";
import app from "../app";
import { socketAuthMiddleware } from "../middlewares/socket.middleware";

import { registerChatSocket } from "../sockets/chat.socket";
import { registerMeetingSocket } from "../sockets/meeting.socket";
import { registerSignalingSocket } from "../sockets/signaling.socket";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.use(socketAuthMiddleware);

/* ==============================
   SOCKET CONNECTION
============================== */

io.on("connection", (socket: any) => {
  console.log(
    `✅ Socket connected: ${socket.user?.name}`
  );

  registerMeetingSocket(io, socket);

  registerChatSocket(io, socket);

  registerSignalingSocket(
    io,
    socket
  );

  socket.on("disconnect", () => {
    console.log(
      `❌ Socket disconnected: ${socket.user?.name}`
    );
  });
});

export default server;
