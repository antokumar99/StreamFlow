import mongoose, { Schema, Document } from "mongoose";

export interface ISummary extends Document {
  meetingId: mongoose.Types.ObjectId;
  transcript: string;
  summary: string;
}

const summarySchema = new Schema<ISummary>(
  {
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
    },

    transcript: {
      type: String,
      required: true,
    },

    summary: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Summary = mongoose.model<ISummary>(
  "Summary",
  summarySchema
);

export default Summary;