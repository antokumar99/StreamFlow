import express from "express";

import {
  createMeeting,
  getMeetingStats,
  getMyMeetings,
  inviteToMeeting,
} from "../controllers/meeting.controller";

import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.get(
  "/",
  protect,
  getMyMeetings
);

router.post(
  "/",
  protect,
  createMeeting
);

router.get(
  "/stats",
  protect,
  getMeetingStats
);

router.post(
  "/invite",
  protect,
  inviteToMeeting
);

export default router;
