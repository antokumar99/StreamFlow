import express from "express";

import {
  getNotifications,
  markNotificationRead,
} from "../controllers/notification.controller";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.get(
  "/",
  protect,
  getNotifications
);

router.patch(
  "/:notificationId/read",
  protect,
  markNotificationRead
);

export default router;
