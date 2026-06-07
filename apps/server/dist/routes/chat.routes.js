"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_controller_1 = require("../controllers/chat.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.get("/users", auth_middleware_1.protect, chat_controller_1.searchUsers);
router.get("/conversations", auth_middleware_1.protect, chat_controller_1.getConversations);
router.post("/conversations/direct", auth_middleware_1.protect, chat_controller_1.createDirectConversation);
router.post("/conversations/group", auth_middleware_1.protect, chat_controller_1.createGroupConversation);
router.get("/conversations/:conversationId/messages", auth_middleware_1.protect, chat_controller_1.getMessages);
exports.default = router;
