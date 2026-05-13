import mongoose, { type Document, type Model, Schema } from "mongoose";
import { connectMongo } from "../mongo";

void connectMongo();

export interface ICognitiveEntity extends Document {
  sessionId: string;
  nodeId: string;
  hypothesis: string;
  physicsAnalysis: string;
  anomalyFlags: string[];
  trustScore: number;
  isCompromised: boolean;
  injectionDetected: boolean;
  injectionContent?: string;
}

const cognitiveEntitySchema = new Schema<ICognitiveEntity>({
  sessionId: {
    type: String,
    required: [true, "Session ID is required"],
    index: true,
    trim: true,
  },
  nodeId: {
    type: String,
    required: [true, "Node ID is required"],
    trim: true,
  },
  hypothesis: {
    type: String,
    required: [true, "Hypothesis is required"],
    trim: true,
  },
  physicsAnalysis: {
    type: String,
    required: [true, "Physics analysis is required"],
    trim: true,
  },
  anomalyFlags: {
    type: [String],
    default: [],
  },
  trustScore: {
    type: Number,
    default: 1.0,
  },
  isCompromised: {
    type: Boolean,
    default: false,
  },
  injectionDetected: {
    type: Boolean,
    default: false,
  },
  injectionContent: {
    type: String,
    trim: true,
  },
});

export const CognitiveEntityModel: Model<ICognitiveEntity> =
  (mongoose.models.CognitiveEntity as Model<ICognitiveEntity>) ??
  mongoose.model<ICognitiveEntity>("CognitiveEntity", cognitiveEntitySchema);

export default CognitiveEntityModel;
