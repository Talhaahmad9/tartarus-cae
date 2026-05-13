import mongoose, { type Document, type Model, Schema } from "mongoose";
import { connectMongo } from "../mongo";

void connectMongo();

export type SessionStatus =
  | "initializing"
  | "reasoning"
  | "debating"
  | "consensus"
  | "resolved";

export interface ISession extends Document {
  sessionId: string;
  status: SessionStatus;
  shards: unknown[];
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    sessionId: {
      type: String,
      required: [true, "Session ID is required"],
      unique: true,
      index: true,
      trim: true,
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: ["initializing", "reasoning", "debating", "consensus", "resolved"],
      default: "initializing",
    },
    shards: {
      type: [Schema.Types.Mixed],
      default: [],
    },
  },
  { timestamps: true }
);

export const SessionModel: Model<ISession> =
  (mongoose.models.Session as Model<ISession>) ??
  mongoose.model<ISession>("Session", sessionSchema);

export default SessionModel;
