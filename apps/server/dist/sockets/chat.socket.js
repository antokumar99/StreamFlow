"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChatSocket = void 0;
const Conversation_model_1 = __importDefault(require("../models/Conversation.model"));
const Message_model_1 = __importDefault(require("../models/Message.model"));
const Notification_model_1 = __importDefault(require("../models/Notification.model"));
const chat_controller_1 = require("../controllers/chat.controller");
const messageCrypto_1 = require("../utils/messageCrypto");
const registerChatSocket = (io, socket) => {
    const userRoom = `user:${socket.user?._id}`;
    socket.join(userRoom);
    socket.on("join-conversation", async (conversationId) => {
        const conversation = await Conversation_model_1.default.findOne({
            _id: conversationId,
            members: socket.user?._id,
        });
        if (conversation) {
            socket.join(`conversation:${conversationId}`);
        }
    });
    socket.on("send-chat-message", async ({ conversationId, type, payload, }) => {
        try {
            const conversation = await Conversation_model_1.default.findOne({
                _id: conversationId,
                members: socket.user?._id,
            });
            if (!conversation) {
                socket.emit("chat-error", "Conversation not found");
                return;
            }
            if (![
                "text",
                "photo",
                "voice",
            ].includes(type)) {
                socket.emit("chat-error", "Unsupported message type");
                return;
            }
            const encrypted = (0, messageCrypto_1.encryptPayload)(payload);
            const message = await Message_model_1.default.create({
                conversationId: conversation._id,
                senderId: socket.user?._id,
                type,
                ...encrypted,
                readBy: [
                    socket.user?._id,
                ],
            });
            conversation.lastMessageAt =
                new Date();
            await conversation.save();
            const serialized = await (0, chat_controller_1.serializeMessage)(message);
            io.to(`conversation:${conversationId}`).emit("receive-chat-message", serialized);
            const recipients = conversation.members.filter((memberId) => memberId.toString() !==
                socket.user?._id.toString());
            await Promise.all(recipients.map(async (recipientId) => {
                const notification = await Notification_model_1.default.create({
                    userId: recipientId,
                    title: "New message",
                    message: `${socket.user?.name} sent you a ${type} message`,
                    type: "message",
                });
                io.to(`user:${recipientId.toString()}`).emit("notification", notification);
                io.to(`user:${recipientId.toString()}`).emit("receive-chat-message", serialized);
            }));
        }
        catch (error) {
            console.error(error);
            socket.emit("chat-error", "Failed to send message");
        }
    });
};
exports.registerChatSocket = registerChatSocket;
