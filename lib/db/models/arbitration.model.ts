import mongoose, { type Document, type Model, Schema } from "mongoose";
import { connectMongo } from "../mongo";

void connectMongo();

export interface IArbitrationResult extends Document {
  sessionId: string;
  absoluteTruthState: unknown;
  compromisedNodes: string[];
  physicsMatrix: unknown;
  arbitrationSummary: string;
  supportingEvidence: unknown[];
  promptInjectionDetected: boolean;
  promptInjectionNodeId?: string;
}

const arbitrationResultSchema = new Schema<IArbitrationResult>({
  sessionId: {
    type: String,
    required: [true, "Session ID is required"],
    unique: true,
    trim: true,
  },
  absoluteTruthState: {
    type: Schema.Types.Mixed,
    required: [true, "Absolute truth state is required"],
  },
  compromisedNodes: {
    type: [String],
    default: [],
  },
  physicsMatrix: {
    type: Schema.Types.Mixed,
    required: [true, "Physics matrix is required"],
  },
  arbitrationSummary: {
    type: String,
    required: [true, "Arbitration summary is required"],
    trim: true,
  },
  supportingEvidence: {
    type: [Schema.Types.Mixed],
    default: [],
  },
  promptInjectionDetected: {
    type: Boolean,
    default: false,
  },
  promptInjectionNodeId: {
    type: String,
    trim: true,
  },
});

export const ArbitrationResultModel: Model<IArbitrationResult> =
  (mongoose.models.ArbitrationResult as Model<IArbitrationResult>) ??
  mongoose.model<IArbitrationResult>("ArbitrationResult", arbitrationResultSchema);

export default ArbitrationResultModel;
