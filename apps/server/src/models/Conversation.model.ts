import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  name?: string;
  type: "direct" | "group";
  members: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  lastMessageAt?: Date;
}

const conversationSchema =
  new Schema<IConversation>(
    {
      name: {
        type: String,
        trim: true,
      },

      type: {
        type: String,
        enum: [
          "direct",
          "group",
        ],
        required: true,
      },

      members: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],

      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      lastMessageAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

conversationSchema.index({
  members: 1,
});

const Conversation =
  mongoose.model<IConversation>(
    "Conversation",
    conversationSchema
  );

export default Conversation;
