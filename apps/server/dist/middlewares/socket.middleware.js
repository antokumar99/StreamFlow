"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = void 0;
const generateToken_1 = require("../utils/generateToken");
const User_model_1 = __importDefault(require("../models/User.model"));
/* =================================
   SOCKET AUTH MIDDLEWARE
================================= */
const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Socket authentication failed"));
        }
        const decoded = (0, generateToken_1.verifyToken)(token);
        const user = await User_model_1.default.findById(decoded.id).select("-password");
        if (!user) {
            return next(new Error("User not found"));
        }
        socket.user = user;
        next();
    }
    catch (error) {
        next(new Error("Invalid socket token"));
    }
};
exports.socketAuthMiddleware = socketAuthMiddleware;
