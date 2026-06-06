import { Response } from "express";

import Meeting from "../models/Meeting.model";
import { AuthRequest } from "../types/auth.types";

export const getMyMeetings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;

    const meetings =
      await Meeting.find({
        participants: userId,
      })
        .sort({
          updatedAt: -1,
        })
        .limit(20)
        .populate(
          "hostId",
          "name email"
        )
        .populate(
          "participants",
          "name email"
        );

    res.status(200).json({
      success: true,
      meetings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch meetings",
    });
  }
};
