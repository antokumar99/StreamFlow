"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("../app"));
const cors_1 = require("./cors");
const socket_middleware_1 = require("../middlewares/socket.middleware");
const chat_socket_1 = require("../sockets/chat.socket");
const meeting_socket_1 = require("../sockets/meeting.socket");
const signaling_socket_1 = require("../sockets/signaling.socket");
const server = http_1.default.createServer(app_1.default);
/* =========================================
   SOCKET.IO SERVER
========================================= */
const io = new socket_io_1.Server(server, {
    cors: {
        origin: cors_1.allowedOrigins,
        credentials: true,
    },
    transports: [
        "websocket",
        "polling",
    ],
    pingTimeout: 60000,
    pingInterval: 25000,
});
exports.io = io;
app_1.default.set("io", io);
/* =========================================
   SOCKET AUTH MIDDLEWARE
========================================= */
io.use(socket_middleware_1.socketAuthMiddleware);
/* =========================================
   SOCKET CONNECTION
========================================= */
io.on("connection", (socket) => {
    console.log(`✅ Socket connected: ${socket.user?.name}`);
    console.log(`Socket ID: ${socket.id}`);
    /* =====================================
       REGISTER SOCKET MODULES
    ===================================== */
    (0, meeting_socket_1.registerMeetingSocket)(io, socket);
    (0, chat_socket_1.registerChatSocket)(io, socket);
    (0, signaling_socket_1.registerSignalingSocket)(io, socket);
    /* =====================================
       SOCKET ERRORS
    ===================================== */
    socket.on("connect_error", (err) => {
        console.log("Socket connect error:", err.message);
    });
    socket.on("error", (err) => {
        console.log("Socket error:", err);
    });
    /* =====================================
       DISCONNECT
    ===================================== */
    socket.on("disconnect", (reason) => {
        console.log(`❌ Socket disconnected: ${socket.user?.name}`);
        console.log(`Reason: ${reason}`);
    });
});
exports.default = server;
