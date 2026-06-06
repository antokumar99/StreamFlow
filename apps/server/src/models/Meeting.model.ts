import mongoose, { Schema, Document } from "mongoose";

export interface IMeeting extends Document {
  roomId: string;
  hostId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  participantCount: number;
  isActive: boolean;
  startedAt: Date;
  endedAt?: Date;
}

const meetingSchema = new Schema<IMeeting>(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },

    hostId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    participantCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Meeting = mongoose.model<IMeeting>(
  "Meeting",
  meetingSchema
);

export default Meeting;
