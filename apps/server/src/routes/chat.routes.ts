import express from "express";

import {
  createDirectConversation,
  createGroupConversation,
  getConversations,
  getMessages,
  searchUsers,
} from "../controllers/chat.controller";

import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.get(
  "/users",
  protect,
  searchUsers
);

router.get(
  "/conversations",
  protect,
  getConversations
);

router.post(
  "/conversations/direct",
  protect,
  createDirectConversation
);

router.post(
  "/conversations/group",
  protect,
  createGroupConversation
);

router.get(
  "/conversations/:conversationId/messages",
  protect,
  getMessages
);

export default router;
