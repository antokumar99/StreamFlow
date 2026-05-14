import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import User from "../models/User.model";

interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader =
      req.headers.authorization;

    if (
      authHeader &&
      authHeader.startsWith("Bearer ")
    ) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });

      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as {
      id: string;
    };

    const user = await User.findById(
      decoded.id
    ).select("-password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });

      return;
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};