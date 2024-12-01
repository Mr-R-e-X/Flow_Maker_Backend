// models/workflow.model.js
import mongoose, { Schema, Document, Types } from "mongoose";

export enum WorkflowStatus {
  Pending = "pending",
  InProgress = "in-progress",
  Completed = "completed",
  Canceled = "canceled",
}

interface INodeData {
  type: string;
  delayDuration?: number;
  emailList?: string[];
  templateId?: Types.ObjectId;
  status: WorkflowStatus;
}

interface IWorkflow extends Document {
  userId: Types.ObjectId;
  flowChartId: Types.ObjectId;
  status: WorkflowStatus;
  nodes: INodeData[];
  endTime?: Date;
}

const workflowSchema = new Schema<IWorkflow>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    flowChartId: {
      type: Schema.Types.ObjectId,
      ref: "FlowChart",
      required: true,
    },
    status: {
      type: String,
      enum: WorkflowStatus,
      default: WorkflowStatus.Pending,
    },
    nodes: [
      {
        type: {
          type: String,
          enum: ["Lead", "Email", "Delay"],
          required: true,
        },
        delayDuration: { type: Number },
        emailList: { type: mongoose.Types.ObjectId, ref: "LeadSource" },
        templateId: { type: Schema.Types.ObjectId, ref: "Template" },
        status: {
          type: String,
          enum: WorkflowStatus,
          default: WorkflowStatus.Pending,
        },
      },
    ],
    endTime: { type: Date },
  },
  { timestamps: true }
);

const Workflow = mongoose.model<IWorkflow>("Workflow", workflowSchema);

export default Workflow;
