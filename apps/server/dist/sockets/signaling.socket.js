"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSignalingSocket = void 0;
const registerSignalingSocket = (io, socket) => {
    /* ==========================
       WEBRTC OFFER
    ========================== */
    socket.on("offer", ({ meetingId, target, offer, }) => {
        if (target) {
            socket
                .to(target)
                .emit("offer", {
                offer,
                senderId: socket.id,
                sender: socket.user,
            });
            return;
        }
        socket
            .to(meetingId)
            .emit("offer", {
            offer,
            senderId: socket.id,
            sender: socket.user,
        });
    });
    /* ==========================
       WEBRTC ANSWER
    ========================== */
    socket.on("answer", ({ meetingId, target, answer, }) => {
        if (target) {
            socket
                .to(target)
                .emit("answer", {
                answer,
                senderId: socket.id,
                sender: socket.user,
            });
            return;
        }
        socket
            .to(meetingId)
            .emit("answer", {
            answer,
            senderId: socket.id,
            sender: socket.user,
        });
    });
    /* ==========================
       ICE CANDIDATE
    ========================== */
    socket.on("ice-candidate", ({ meetingId, target, candidate, }) => {
        if (target) {
            socket
                .to(target)
                .emit("ice-candidate", {
                candidate,
                senderId: socket.id,
                sender: socket.user,
            });
            return;
        }
        socket
            .to(meetingId)
            .emit("ice-candidate", {
            candidate,
            senderId: socket.id,
            sender: socket.user,
        });
    });
};
exports.registerSignalingSocket = registerSignalingSocket;
