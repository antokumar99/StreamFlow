import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "message" | "meeting_invite";
  data?: {
    roomId?: string;
    callType?: "video" | "audio";
    inviteUrl?: string;
    fromUserId?: mongoose.Types.ObjectId;
    fromName?: string;
  };
  isRead: boolean;
}

const notificationSchema =
  new Schema<INotification>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      title: {
        type: String,
        required: true,
      },

      message: {
        type: String,
        required: true,
      },

      type: {
        type: String,
        enum: ["message", "meeting_invite"],
        default: "message",
      },

      data: {
        roomId: String,
        callType: {
          type: String,
          enum: ["video", "audio"],
        },
        inviteUrl: String,
        fromUserId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        fromName: String,
      },

      isRead: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

const Notification =
  mongoose.model<INotification>(
    "Notification",
    notificationSchema
  );

export default Notification;
