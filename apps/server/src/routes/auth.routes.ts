import express from "express";

import {
  loginUser,
  registerUser,
  getMe,
  logoutUser
} from "../controllers/auth.controller";

import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

/* =========================
   AUTH ROUTES
========================= */

router.post(
  "/register",
  registerUser
);

router.post(
  "/login",
  loginUser
);

router.get(
  "/me",
  protect,
  getMe
);

router.post(
  "/logout",
  protect,
  logoutUser
);

export default router;