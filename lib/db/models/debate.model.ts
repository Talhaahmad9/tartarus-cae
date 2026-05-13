import mongoose, { type Document, type Model, Schema } from "mongoose";
import { connectMongo } from "../mongo";

void connectMongo();

export interface IDebateExchange extends Document {
  sessionId: string;
  round: number;
  challengerId: string;
  targetId: string;
  argument: string;
  contradictionDetected: boolean;
  contradictionReason?: string;
  evidenceKeys: string[];
  isDevilsAdvocate?: boolean;
  daDefense?: string;
  daUpheld?: boolean;
}

const debateExchangeSchema = new Schema<IDebateExchange>({
  sessionId: {
    type: String,
    required: [true, "Session ID is required"],
    index: true,
    trim: true,
  },
  round: {
    type: Number,
    required: [true, "Round is required"],
    min: 1,
  },
  challengerId: {
    type: String,
    required: [true, "Challenger ID is required"],
    trim: true,
  },
  targetId: {
    type: String,
    required: [true, "Target ID is required"],
    trim: true,
  },
  argument: {
    type: String,
    required: [true, "Argument is required"],
    trim: true,
  },
  contradictionDetected: {
    type: Boolean,
    required: [true, "Contradiction flag is required"],
    default: false,
  },
  contradictionReason: {
    type: String,
    trim: true,
  },
  evidenceKeys: {
    type: [String],
    default: [],
  },
  isDevilsAdvocate: {
    type: Boolean,
    default: false,
  },
  daDefense: {
    type: String,
    trim: true,
  },
  daUpheld: {
    type: Boolean,
  },
});

export const DebateExchangeModel: Model<IDebateExchange> =
  (mongoose.models.DebateExchange as Model<IDebateExchange>) ??
  mongoose.model<IDebateExchange>("DebateExchange", debateExchangeSchema);

export default DebateExchangeModel;
