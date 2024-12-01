import mongoose, { Schema, Document, Types } from "mongoose";

interface IFlowChart extends Document {
  title: string;
  description?: string;
  userId: Types.ObjectId;
  nodes: Types.ObjectId[];
  edges: Types.ObjectId[];
}

const flowSchema = new Schema<IFlowChart>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    nodes: [{ type: Schema.Types.ObjectId, ref: "Node", required: true }],
    edges: [{ type: Schema.Types.ObjectId, ref: "Edge", required: true }],
  },
  {
    timestamps: true,
  }
);

const FlowChart = mongoose.model<IFlowChart>("FlowChart", flowSchema);
export default FlowChart;
