"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.getMe = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_model_1 = __importDefault(require("../models/User.model"));
const generateToken_1 = require("../utils/generateToken");
/* =========================
   REGISTER USER
========================= */
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Check user exists
        const userExists = await User_model_1.default.findOne({
            email,
        });
        if (userExists) {
            res.status(400).json({
                success: false,
                message: "User already exists",
            });
            return;
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create user
        const user = await User_model_1.default.create({
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
            token: (0, generateToken_1.generateToken)(user._id.toString()),
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};
exports.registerUser = registerUser;
/* =========================
   LOGIN USER
========================= */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await User_model_1.default.findOne({
            email,
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
            return;
        }
        // Compare password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials",
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
            token: (0, generateToken_1.generateToken)(user._id.toString()),
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};
exports.loginUser = loginUser;
/* =========================
   GET CURRENT USER
========================= */
const getMe = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};
exports.getMe = getMe;
/* =========================
   LOGOUT USER
========================= */
const logoutUser = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};
exports.logoutUser = logoutUser;
