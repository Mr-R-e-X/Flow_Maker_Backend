import mongoose, { Schema, Types, Document } from "mongoose";

export interface IEdgeInterface extends Document {
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
}

const edgeSchema = new Schema<IEdgeInterface>(
  {
    source: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
    animated: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const Edge = mongoose.model<IEdgeInterface>("Edge", edgeSchema);
export default Edge;
