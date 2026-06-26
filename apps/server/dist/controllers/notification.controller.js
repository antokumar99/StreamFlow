"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationRead = exports.getNotifications = void 0;
const Notification_model_1 = __importDefault(require("../models/Notification.model"));
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification_model_1.default.find({
            userId: req.user?._id,
        })
            .sort({
            createdAt: -1,
        })
            .limit(50);
        res.status(200).json({
            success: true,
            notifications,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
};
exports.getNotifications = getNotifications;
const markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification_model_1.default.findOneAndUpdate({
            _id: req.params.notificationId,
            userId: req.user?._id,
        }, {
            $set: {
                isRead: true,
            },
        }, {
            new: true,
        });
        if (!notification) {
            res.status(404).json({
                success: false,
                message: "Notification not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            notification,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to update notification",
        });
    }
};
exports.markNotificationRead = markNotificationRead;
