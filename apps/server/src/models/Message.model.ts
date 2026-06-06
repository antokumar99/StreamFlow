import mongoose, { Schema, Document } from "mongoose";

export type MessageType =
  | "text"
  | "photo"
  | "voice";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  type: MessageType;
  encryptedPayload: string;
  iv: string;
  authTag: string;
  readBy: mongoose.Types.ObjectId[];
}

const messageSchema =
  new Schema<IMessage>(
    {
      conversationId: {
        type: Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
      },

      senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      type: {
        type: String,
        enum: [
          "text",
          "photo",
          "voice",
        ],
        required: true,
      },

      encryptedPayload: {
        type: String,
        required: true,
      },

      iv: {
        type: String,
        required: true,
      },

      authTag: {
        type: String,
        required: true,
      },

      readBy: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    {
      timestamps: true,
    }
  );

messageSchema.index({
  conversationId: 1,
  createdAt: -1,
});

const Message = mongoose.model<IMessage>(
  "Message",
  messageSchema
);

export default Message;
