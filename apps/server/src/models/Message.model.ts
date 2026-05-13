import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  meetingId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  message: string;
}

const messageSchema = new Schema<IMessage>(
  {
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model<IMessage>(
  "Message",
  messageSchema
);

export default Message;