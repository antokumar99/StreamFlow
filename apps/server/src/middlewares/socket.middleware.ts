import {
    Request,
    Response,
    NextFunction,
} from "express";
import { AuthenticatedSocket } from "../types/socket.types";
import { verifyToken } from "../utils/generateToken";
import User from "../models/User.model";


/* =================================
   SOCKET AUTH MIDDLEWARE
================================= */

export const socketAuthMiddleware =
  async (
    socket: AuthenticatedSocket,
    next: (err?: Error) => void
  ) => {
    try {
      const token =
        socket.handshake.auth.token;

      if (!token) {
        return next(
          new Error(
            "Socket authentication failed"
          )
        );
      }

      const decoded = verifyToken(token);

      const user =
        await User.findById(
          decoded.id
        ).select("-password");

      if (!user) {
        return next(
          new Error(
            "User not found"
          )
        );
      }

      socket.user = user;

      next();
    } catch (error) {
      next(
        new Error(
          "Invalid socket token"
        )
      );
    }
  };