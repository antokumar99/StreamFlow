import { Response } from "express";
import mongoose from "mongoose";

import Conversation from "../models/Conversation.model";
import Message, { IMessage } from "../models/Message.model";
import User from "../models/User.model";
import { AuthRequest } from "../types/auth.types";
import { decryptPayload } from "../utils/messageCrypto";

const toObjectId = (
  value: string
) => new mongoose.Types.ObjectId(value);

const serializeMessage = async (
  message: IMessage
) => {
  const populated =
    await message.populate(
      "senderId",
      "name email avatar"
    );

  return {
    _id: populated._id,
    conversationId:
      populated.conversationId,
    sender:
      populated.senderId,
    type: populated.type,
    payload: decryptPayload(
      populated.encryptedPayload,
      populated.iv,
      populated.authTag
    ),
    readBy: populated.readBy,
    createdAt:
      populated.get("createdAt"),
    updatedAt:
      populated.get("updatedAt"),
  };
};

export const searchUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const query = String(
      req.query.q || ""
    ).trim();

    if (query.length < 2) {
      res.status(200).json({
        success: true,
        users: [],
      });

      return;
    }

    const users = await User.find({
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
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Failed to search users",
    });
  }
};

export const createDirectConversation =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.body;
      const currentUserId =
        req.user?._id;

      if (!userId) {
        res.status(400).json({
          success: false,
          message:
            "User is required",
        });

        return;
      }

      const members = [
        currentUserId,
        toObjectId(userId),
      ];

      let conversation =
        await Conversation.findOne({
          type: "direct",
          members: {
            $all: members,
            $size: 2,
          },
        });

      if (!conversation) {
        conversation =
          await Conversation.create({
            type: "direct",
            members,
            createdBy:
              currentUserId,
          });
      }

      await conversation.populate(
        "members",
        "name email avatar"
      );

      res.status(200).json({
        success: true,
        conversation,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to create conversation",
      });
    }
  };

export const createGroupConversation =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { name, memberIds } =
        req.body;

      const uniqueMembers = Array.from(
        new Set([
          req.user?._id.toString(),
          ...(memberIds || []),
        ])
      ).map((id) => toObjectId(id));

      if (
        !name ||
        uniqueMembers.length < 3
      ) {
        res.status(400).json({
          success: false,
          message:
            "Group name and at least two other members are required",
        });

        return;
      }

      const conversation =
        await Conversation.create({
          name,
          type: "group",
          members: uniqueMembers,
          createdBy:
            req.user?._id,
        });

      await conversation.populate(
        "members",
        "name email avatar"
      );

      res.status(201).json({
        success: true,
        conversation,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to create group",
      });
    }
  };

export const getConversations =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const conversations =
        await Conversation.find({
          members: req.user?._id,
        })
          .sort({
            lastMessageAt: -1,
            updatedAt: -1,
          })
          .populate(
            "members",
            "name email avatar"
          );

      res.status(200).json({
        success: true,
        conversations,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch conversations",
      });
    }
  };

export const getMessages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const conversation =
      await Conversation.findOne({
        _id: req.params.conversationId,
        members: req.user?._id,
      });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message:
          "Conversation not found",
      });

      return;
    }

    const messages =
      await Message.find({
        conversationId:
          conversation._id,
      }).sort({
        createdAt: 1,
      });

    const serialized =
      await Promise.all(
        messages.map(
          serializeMessage
        )
      );

    res.status(200).json({
      success: true,
      messages: serialized,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch messages",
    });
  }
};

export { serializeMessage };
