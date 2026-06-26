"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteToMeeting = exports.getMeetingStats = exports.getMyMeetings = exports.createMeeting = void 0;
const crypto_1 = require("crypto");
const Meeting_model_1 = __importDefault(require("../models/Meeting.model"));
const Notification_model_1 = __importDefault(require("../models/Notification.model"));
const Summery_model_1 = __importDefault(require("../models/Summery.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const getDurationMinutes = (startedAt, endedAt) => {
    if (!startedAt)
        return 0;
    const endTime = endedAt || new Date();
    return Math.max(0, Math.round((endTime.getTime() -
        startedAt.getTime()) /
        60000));
};
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const createMeeting = async (req, res) => {
    try {
        const userId = req.user?._id;
        const callType = req.body?.callType === "audio"
            ? "audio"
            : "video";
        const meeting = await Meeting_model_1.default.create({
            roomId: (0, crypto_1.randomUUID)(),
            callType,
            hostId: userId,
            participants: [userId],
            participantCount: 0,
            isActive: true,
            startedAt: new Date(),
        });
        res.status(201).json({
            success: true,
            meeting,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create meeting",
        });
    }
};
exports.createMeeting = createMeeting;
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
const getMeetingStats = async (req, res) => {
    try {
        const userId = String(req.user?._id);
        const meetings = await Meeting_model_1.default.find({
            participants: req.user?._id,
        })
            .sort({
            updatedAt: -1,
        })
            .populate("participants", "name email")
            .populate("hostId", "name email");
        const partnerMap = new Map();
        let totalMinutes = 0;
        let videoCalls = 0;
        let audioCalls = 0;
        meetings.forEach((meeting) => {
            const durationMinutes = getDurationMinutes(meeting.startedAt, meeting.endedAt);
            totalMinutes += durationMinutes;
            if (meeting.callType === "audio") {
                audioCalls += 1;
            }
            else {
                videoCalls += 1;
            }
            meeting.participants.forEach((participant) => {
                const participantId = String(participant._id || participant);
                if (participantId === userId) {
                    return;
                }
                const current = partnerMap.get(participantId) || {
                    userId: participantId,
                    name: participant.name ||
                        "Participant",
                    email: participant.email ||
                        "",
                    calls: 0,
                    minutes: 0,
                };
                current.calls += 1;
                current.minutes +=
                    durationMinutes;
                partnerMap.set(participantId, current);
            });
        });
        const callPartners = Array.from(partnerMap.values()).sort((a, b) => b.calls - a.calls ||
            b.minutes - a.minutes);
        const summaryCount = await Summery_model_1.default.countDocuments({
            meetingId: {
                $in: meetings.map((meeting) => meeting._id),
            },
        });
        res.status(200).json({
            success: true,
            stats: {
                totalMeetings: meetings.length,
                activeMeetings: meetings.filter((meeting) => meeting.isActive).length,
                totalMinutes,
                totalHours: Math.round((totalMinutes / 60) * 10) / 10,
                videoCalls,
                audioCalls,
                uniquePeople: callPartners.length,
                summaryCount,
                mostCalled: callPartners[0] || null,
                callPartners,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch meeting stats",
        });
    }
};
exports.getMeetingStats = getMeetingStats;
const inviteToMeeting = async (req, res) => {
    try {
        const { username, roomId, callType } = req.body;
        if (!username || !roomId) {
            res.status(400).json({
                success: false,
                message: "Username and room ID are required",
            });
            return;
        }
        const meeting = await Meeting_model_1.default.findOne({
            roomId,
        }).select("isActive endedAt");
        if (meeting?.endedAt &&
            !meeting.isActive) {
            res.status(410).json({
                success: false,
                message: "This meeting room has ended",
            });
            return;
        }
        const invitedUser = await User_model_1.default.findOne({
            name: {
                $regex: `^${escapeRegex(String(username).trim())}$`,
                $options: "i",
            },
        }).select("name email");
        if (!invitedUser) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        if (String(invitedUser._id) ===
            String(req.user?._id)) {
            res.status(400).json({
                success: false,
                message: "You cannot invite yourself",
            });
            return;
        }
        const safeCallType = callType === "audio"
            ? "audio"
            : "video";
        const inviteUrl = `/meeting/${roomId}${safeCallType === "audio"
            ? "?type=audio"
            : ""}`;
        const notification = await Notification_model_1.default.create({
            userId: invitedUser._id,
            title: "Meeting invitation",
            message: `${req.user?.name} invited you to a ${safeCallType} call`,
            type: "meeting_invite",
            data: {
                roomId,
                callType: safeCallType,
                inviteUrl,
                fromUserId: req.user?._id,
                fromName: req.user?.name,
            },
        });
        req.app
            .get("io")
            ?.to(`user:${invitedUser._id.toString()}`)
            .emit("notification", notification);
        res.status(201).json({
            success: true,
            notification,
            invitedUser,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to send invitation",
        });
    }
};
exports.inviteToMeeting = inviteToMeeting;
