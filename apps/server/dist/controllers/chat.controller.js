"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeMessage = exports.getMessages = exports.getConversations = exports.createGroupConversation = exports.createDirectConversation = exports.searchUsers = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Conversation_model_1 = __importDefault(require("../models/Conversation.model"));
const Message_model_1 = __importDefault(require("../models/Message.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const messageCrypto_1 = require("../utils/messageCrypto");
const toObjectId = (value) => new mongoose_1.default.Types.ObjectId(value);
const serializeMessage = async (message) => {
    const populated = await message.populate("senderId", "name email avatar");
    return {
        _id: populated._id,
        conversationId: populated.conversationId,
        sender: populated.senderId,
        type: populated.type,
        payload: (0, messageCrypto_1.decryptPayload)(populated.encryptedPayload, populated.iv, populated.authTag),
        readBy: populated.readBy,
        createdAt: populated.get("createdAt"),
        updatedAt: populated.get("updatedAt"),
    };
};
exports.serializeMessage = serializeMessage;
const searchUsers = async (req, res) => {
    try {
        const query = String(req.query.q || "").trim();
        if (query.length < 2) {
            res.status(200).json({
                success: true,
                users: [],
            });
            return;
        }
        const users = await User_model_1.default.find({
            _id: {
                $ne: req.user?._id,
            },
            name: {
                $regex: query,
                $options: "i",
            },
        })
            .select("name email avatar")
            .limit(10);
        res.status(200).json({
            success: true,
            users,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to search users",
        });
    }
};
exports.searchUsers = searchUsers;
const createDirectConversation = async (req, res) => {
    try {
        const { userId } = req.body;
        const currentUserId = req.user?._id;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: "User is required",
            });
            return;
        }
        const members = [
            currentUserId,
            toObjectId(userId),
        ];
        let conversation = await Conversation_model_1.default.findOne({
            type: "direct",
            members: {
                $all: members,
                $size: 2,
            },
        });
        if (!conversation) {
            conversation =
                await Conversation_model_1.default.create({
                    type: "direct",
                    members,
                    createdBy: currentUserId,
                });
        }
        await conversation.populate("members", "name email avatar");
        res.status(200).json({
            success: true,
            conversation,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create conversation",
        });
    }
};
exports.createDirectConversation = createDirectConversation;
const createGroupConversation = async (req, res) => {
    try {
        const { name, memberIds } = req.body;
        const uniqueMembers = Array.from(new Set([
            req.user?._id.toString(),
            ...(memberIds || []),
        ])).map((id) => toObjectId(id));
        if (!name ||
            uniqueMembers.length < 3) {
            res.status(400).json({
                success: false,
                message: "Group name and at least two other members are required",
            });
            return;
        }
        const conversation = await Conversation_model_1.default.create({
            name,
            type: "group",
            members: uniqueMembers,
            createdBy: req.user?._id,
        });
        await conversation.populate("members", "name email avatar");
        res.status(201).json({
            success: true,
            conversation,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create group",
        });
    }
};
exports.createGroupConversation = createGroupConversation;
const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation_model_1.default.find({
            members: req.user?._id,
        })
            .sort({
            lastMessageAt: -1,
            updatedAt: -1,
        })
            .populate("members", "name email avatar");
        res.status(200).json({
            success: true,
            conversations,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch conversations",
        });
    }
};
exports.getConversations = getConversations;
const getMessages = async (req, res) => {
    try {
        const conversation = await Conversation_model_1.default.findOne({
            _id: req.params.conversationId,
            members: req.user?._id,
        });
        if (!conversation) {
            res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
            return;
        }
        const messages = await Message_model_1.default.find({
            conversationId: conversation._id,
        }).sort({
            createdAt: 1,
        });
        const serialized = await Promise.all(messages.map(serializeMessage));
        res.status(200).json({
            success: true,
            messages: serialized,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch messages",
        });
    }
};
exports.getMessages = getMessages;
