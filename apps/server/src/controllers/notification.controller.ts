import { Response } from "express";

import Meeting from "../models/Meeting.model";
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
        .limit(50)
        .lean();

    // Flag invites whose meeting already ended so the client
    // can hide the Join action.
    const roomIds = Array.from(
      new Set(
        notifications
          .filter(
            (notification) =>
              notification.type ===
                "meeting_invite" &&
              notification.data?.roomId
          )
          .map(
            (notification) =>
              notification.data!.roomId!
          )
      )
    );

    const endedRooms = new Set<string>();

    if (roomIds.length > 0) {
      const meetings =
        await Meeting.find({
          roomId: {
            $in: roomIds,
          },
        }).select(
          "roomId isActive endedAt"
        );

      meetings.forEach((meeting) => {
        if (
          meeting.endedAt &&
          !meeting.isActive
        ) {
          endedRooms.add(
            meeting.roomId
          );
        }
      });
    }

    const payload = notifications.map(
      (notification) =>
        notification.type ===
          "meeting_invite" &&
        notification.data?.roomId &&
        endedRooms.has(
          notification.data.roomId
        )
          ? {
              ...notification,
              data: {
                ...notification.data,
                expired: true,
              },
            }
          : notification
    );

    res.status(200).json({
      success: true,
      notifications: payload,
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

export const markAllNotificationsRead =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      await Notification.updateMany(
        {
          userId: req.user?._id,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        }
      );

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to update notifications",
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
