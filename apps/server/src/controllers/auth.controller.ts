import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import User from "../models/User.model";
import { generateToken } from "../utils/generateToken";
import { AuthRequest } from "../types/auth.types";

/* =========================
   REGISTER USER
========================= */

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } =
      req.body;

    // Check user exists
    const userExists = await User.findOne({
      email,
    });

    if (userExists) {
      res.status(400).json({
        success: false,
        message:
          "User already exists",
      });

      return;
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },

      token: generateToken(
        user._id.toString()
      ),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* =========================
   LOGIN USER
========================= */

export const loginUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } =
      req.body;

    // Find user
    const user = await User.findOne({
      email,
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message:
          "Invalid credentials",
      });

      return;
    }

    // Compare password
    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message:
          "Invalid credentials",
      });

      return;
    }

    res.status(200).json({
      success: true,

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },

      token: generateToken(
        user._id.toString()
      ),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



/* =========================
   GET CURRENT USER
========================= */

export const getMe = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* =========================
   LOGOUT USER
========================= */

export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
