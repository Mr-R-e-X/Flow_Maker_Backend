import mongoose, { Schema, Types, Document } from "mongoose";

export interface ITemplate extends Document {
  name: string;
  subject: string;
  body: string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const templateSchema = new Schema<ITemplate>(
  {
    name: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Template = mongoose.model<ITemplate>("Template", templateSchema);

export default Template;
