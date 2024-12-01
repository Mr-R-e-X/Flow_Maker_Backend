import mongoose, { Schema, Types, Document } from "mongoose";
import { UploadResponse } from "../utils/uploadCloudinary.js";

export interface ILeadSource extends Document {
  name: string;
  file: UploadResponse;
  userId: Types.ObjectId;
}

const leadSourceSchema = new Schema<ILeadSource>(
  {
    name: { type: String, required: true },
    file: {
      publicId: { type: String, required: true },
      url: { type: String, required: true },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const LeadSource = mongoose.model<ILeadSource>("LeadSource", leadSourceSchema);
export default LeadSource;
