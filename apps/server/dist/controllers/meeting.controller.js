"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyMeetings = void 0;
const Meeting_model_1 = __importDefault(require("../models/Meeting.model"));
const getMyMeetings = async (req, res) => {
    try {
        const userId = req.user?._id;
        const meetings = await Meeting_model_1.default.find({
            participants: userId,
        })
            .sort({
            updatedAt: -1,
        })
            .limit(20)
            .populate("hostId", "name email")
            .populate("participants", "name email");
        res.status(200).json({
            success: true,
            meetings,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch meetings",
        });
    }
};
exports.getMyMeetings = getMyMeetings;
