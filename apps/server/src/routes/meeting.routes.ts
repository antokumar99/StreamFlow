import express from "express";

import { getMyMeetings } from "../controllers/meeting.controller";

import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.get(
  "/",
  protect,
  getMyMeetings
);

export default router;
