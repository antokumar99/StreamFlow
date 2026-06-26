"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMeetingSocket = void 0;
const Meeting_model_1 = __importDefault(require("../models/Meeting.model"));
const rooms = {};
const removeParticipantFromRoom = (io, socket, roomId) => {
    const room = rooms[roomId];
    if (!room)
        return;
    const participantExists = room.some((participant) => participant.socketId === socket.id);
    if (!participantExists)
        return;
    rooms[roomId] = room.filter((participant) => participant.socketId !== socket.id);
    socket.leave(roomId);
    socket.to(roomId).emit("user-left", socket.id);
    io.to(roomId).emit("participant-count", rooms[roomId].length);
    if (rooms[roomId].length === 0) {
        delete rooms[roomId];
        Meeting_model_1.default.findOneAndUpdate({
            roomId,
        }, {
            $set: {
                isActive: false,
                participantCount: 0,
                endedAt: new Date(),
            },
        }).catch((error) => {
            console.error("Failed to end meeting:", error);
        });
        return;
    }
    Meeting_model_1.default.findOneAndUpdate({
        roomId,
    }, {
        $set: {
            participantCount: rooms[roomId].length,
        },
    }).catch((error) => {
        console.error("Failed to update meeting participant count:", error);
    });
};
const registerMeetingSocket = (io, socket) => {
    /* =========================
       JOIN ROOM
    ========================= */
    socket.on("join-meeting", async (payload) => {
        const roomId = typeof payload === "string"
            ? payload
            : payload.roomId;
        const callType = typeof payload === "string"
            ? "video"
            : payload.callType === "audio"
                ? "audio"
                : "video";
        if (!roomId)
            return;
        const existingMeeting = await Meeting_model_1.default.findOne({
            roomId,
        }).select("isActive endedAt");
        if (existingMeeting?.endedAt &&
            !existingMeeting.isActive) {
            socket.emit("meeting-ended", {
                roomId,
            });
            return;
        }
        console.log(`${socket.user?.name} joined ${roomId}`);
        /* ======================
           ROOM INIT
        ====================== */
        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }
        const existingParticipants = rooms[roomId].filter((participant) => participant.socketId !==
            socket.id);
        const alreadyInRoom = rooms[roomId].some((participant) => participant.socketId ===
            socket.id);
        if (alreadyInRoom) {
            socket.emit("existing-participants", existingParticipants);
            return;
        }
        socket.join(roomId);
        /* ======================
           ADD USER
        ====================== */
        rooms[roomId].push({
            socketId: socket.id,
            userId: socket.user?._id,
            name: socket.user?.name,
        });
        try {
            await Meeting_model_1.default.findOneAndUpdate({
                roomId,
            }, {
                $set: {
                    isActive: true,
                    endedAt: null,
                    participantCount: rooms[roomId].length,
                    callType,
                },
                $setOnInsert: {
                    roomId,
                    hostId: socket.user?._id,
                    startedAt: new Date(),
                },
                $addToSet: {
                    participants: socket.user?._id,
                },
            }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            });
        }
        catch (error) {
            console.error("Failed to save meeting:", error);
        }
        /* ======================
           SEND EXISTING USERS
        ====================== */
        socket.emit("existing-participants", existingParticipants);
        /* ======================
           NOTIFY OTHERS
        ====================== */
        socket
            .to(roomId)
            .emit("user-joined", {
            socketId: socket.id,
            userId: socket.user?._id,
            name: socket.user?.name,
        });
        /* ======================
           PARTICIPANT COUNT
        ====================== */
        io.to(roomId).emit("participant-count", rooms[roomId].length);
    });
    socket.on("whiteboard-draw", ({ roomId, stroke, }) => {
        if (!roomId || !stroke)
            return;
        socket
            .to(roomId)
            .emit("whiteboard-draw", stroke);
    });
    socket.on("meeting-chat-message", ({ roomId, message, }) => {
        const value = String(message || "").trim();
        if (!roomId || !value)
            return;
        io.to(roomId).emit("meeting-chat-message", {
            id: `${socket.id}-${Date.now()}`,
            roomId,
            message: value,
            senderId: socket.user?._id,
            senderName: socket.user?.name ||
                "Participant",
            createdAt: new Date().toISOString(),
        });
    });
    socket.on("whiteboard-clear", (roomId) => {
        if (!roomId)
            return;
        socket
            .to(roomId)
            .emit("whiteboard-clear");
    });
    /* =========================
       LEAVE ROOM
    ========================= */
    socket.on("leave-meeting", (roomId) => {
        if (!roomId)
            return;
        removeParticipantFromRoom(io, socket, roomId);
    });
    /* =========================
       DISCONNECT
    ========================= */
    socket.on("disconnect", () => {
        for (const roomId of Object.keys(rooms)) {
            removeParticipantFromRoom(io, socket, roomId);
        }
        console.log("User disconnected");
    });
};
exports.registerMeetingSocket = registerMeetingSocket;
