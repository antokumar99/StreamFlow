import { Response } from "express";

import Notification from "../models/Notification.model";
import { AuthRequest } from "../types/auth.types";

export const getNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const notifications =
      await Notification.find({
        userId: req.user?._id,
      })
        .sort({
          createdAt: -1,
        })
        .limit(50);

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch notifications",
    });
  }
};

export const markNotificationRead =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const notification =
        await Notification.findOneAndUpdate(
          {
            _id: req.params.notificationId,
            userId: req.user?._id,
          },
          {
            $set: {
              isRead: true,
            },
          },
          {
            new: true,
          }
        );

      if (!notification) {
        res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });

        return;
      }

      res.status(200).json({
        success: true,
        notification,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to update notification",
      });
    }
  };
