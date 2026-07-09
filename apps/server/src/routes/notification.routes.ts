import express from "express";

import {
  getNotifications,
  markAllNotificationsRead,
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
  "/read-all",
  protect,
  markAllNotificationsRead
);

router.patch(
  "/:notificationId/read",
  protect,
  markNotificationRead
);

export default router;
