import mongoose, { Schema, Types, Document } from "mongoose";

enum NodeType {
  coldEmail = "Email",
  delay = "Delay",
  leadSource = "Lead",
}
interface NodePosition {
  x: number;
  y: number;
}
interface NodeData {
  label: string;
  source?: Types.ObjectId;
  template?: Types.ObjectId;
  delay?: number;
}

export interface INode extends Document {
  type: NodeType;
  data: NodeData;
  id: string;
  position: NodePosition;
}

const nodeSchema = new Schema<INode>(
  {
    type: {
      type: String,
      enum: Object.values(NodeType),
      required: true,
    },
    id: {
      type: String,
    },
    data: {
      label: {
        type: String,
      },
      source: {
        type: Schema.Types.ObjectId,
        ref: "LeadSource",
      },
      template: {
        type: Schema.Types.ObjectId,
        ref: "Template",
      },
      delay: {
        type: Number,
      },
    },
    position: {
      x: {
        type: Number,
        required: true,
      },
      y: {
        type: Number,
        required: true,
      },
    },
  },
  { timestamps: true }
);

const Node = mongoose.model<INode>("Node", nodeSchema);

export default Node;
