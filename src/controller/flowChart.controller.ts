import { NextFunction, Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import agenda from "../config/agenda.js";
import { CustomRequest } from "../middleware/jwt.middleware.js";
import Edge from "../model/edge.model.js";
import FlowChart from "../model/flowChart.model.js";
import LeadSource from "../model/leadSources.model.js";
import Node from "../model/nodes.model.js";
import Workflow from "../model/servicesStatus.model.js";
import Template, { ITemplate } from "../model/template.model.js";
import {
  getEmailsAndUsernamesFromTable,
  parseBufferCsvToTable,
} from "../services/csvparser.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import AsyncHandler from "../utils/asyncHandler.js";

const fetchFlowChartDetails = async (id: string) => {
  return await FlowChart.aggregate([
    { $match: { _id: new Types.ObjectId(id) } },
    {
      $lookup: {
        from: "nodes",
        localField: "nodes",
        foreignField: "_id",
        as: "nodeDetails",
      },
    },
    {
      $lookup: {
        from: "edges",
        localField: "edges",
        foreignField: "_id",
        as: "edgeDetails",
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        userId: 1,
        leadSource: 1,
        nodeDetails: 1,
        edgeDetails: 1,
      },
    },
  ]);
};

const getSingleFlowChartDetails = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const flowChartDetails = await fetchFlowChartDetails(id);

    if (!flowChartDetails || flowChartDetails.length === 0) {
      throw new ApiError(404, "Flowchart not found");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Successfully fetched flowchart details",
          flowChartDetails
        )
      );
  }
);

const getAllFlowCharts = AsyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const flowCharts = await FlowChart.find({ userId: req.user?._id }).select(
      "title description"
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, "Successfully fetched flowcharts", flowCharts)
      );
  }
);

const createNode = AsyncHandler(
  async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { nodesList } = req.body;
    if (!nodesList) {
      throw new ApiError(400, "Nodes list is required");
    }

    const nodes = nodesList.map((node) => {
      if (node.type === "Lead") {
        return {
          type: node.type,
          id: node.id,
          data: {
            label: node.data?.label,
            type: node.data?.type,
            source: node.data?.source,
          },
          position: node.position,
        };
      } else if (node.type === "Email") {
        return {
          type: node.type,
          id: node.id,
          data: {
            label: node.data?.label,
            type: node.data?.type,
            template: node.data?.source,
          },
          position: node.position,
        };
      } else if (node.type === "Delay") {
        const [value, unit] = node.data?.source?.split(" ") || [];
        const unitVal = unit === "minutes" ? 1 : unit === "hours" ? 60 : 1440;
        const delay = Number(value) * unitVal;

        return {
          type: node.type,
          id: node.id,
          data: {
            type: node.data?.type,
            label: node.data?.label,
            delay,
          },
          position: node.position,
        };
      }
    });

    const createdNodes = await Node.insertMany(nodes);

    res
      .status(201)
      .json(new ApiResponse(201, "Nodes created successfully", createdNodes));
  }
);

const createEdge = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { edgesList } = req.body;

    if (!edgesList || !Array.isArray(edgesList)) {
      throw new ApiError(400, "Edges list is required and must be an array");
    }

    const edges = edgesList.map((edge) => ({
      source: edge.source,
      target: edge.target,
      type: edge.type,
      animated: edge.animated,
    }));

    const createdEdges = await Edge.insertMany(edges);
    res
      .status(201)
      .json(new ApiResponse(201, "Edges created successfully", createdEdges));
  }
);

const createFlowChart = AsyncHandler(
  async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { title, description, nodes, edges } = req.body;

    if (!title || !description || !nodes || !edges) {
      throw new ApiError(
        400,
        "Title, description, nodes, and edges are required"
      );
    }

    const existingFlowChart = await FlowChart.findOne({
      title,
      userId: new mongoose.Types.ObjectId(req.user?._id),
    });

    if (existingFlowChart) {
      throw new ApiError(409, "A flowchart with the same title already exists");
    }

    const flowChart = await FlowChart.create({
      title,
      description,
      userId: req.user?._id,
      nodes,
      edges,
    });

    if (!flowChart) {
      throw new ApiError(500, "Failed to create flowchart");
    }

    const workflow = await scheduleWorkflow(
      req.user?._id!,
      flowChart._id as mongoose.Types.ObjectId
    );
    res.status(201).json(
      new ApiResponse(201, "Flowchart created and workflow scheduled", {
        flowChart,
        workflow,
      })
    );
  }
);

const removeFlowChart = AsyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { flowChartId } = req.params;

    if (!flowChartId) {
      throw new ApiError(400, "Flowchart ID is required");
    }

    const flowChart = await FlowChart.findById(flowChartId);
    if (!flowChart) {
      throw new ApiError(404, "Flowchart not found");
    }

    await Node.deleteMany({ _id: { $in: flowChart.nodes } });
    await Edge.deleteMany({ _id: { $in: flowChart.edges } });
    await FlowChart.findByIdAndDelete(flowChartId);

    res
      .status(200)
      .json(
        new ApiResponse(200, "Flowchart and related data removed successfully")
      );
  }
);

const scheduleWorkflow = async (
  userId: string,
  flowChartId: Types.ObjectId
) => {
  const flowChart = await FlowChart.findById(flowChartId)
    .populate("nodes")
    .lean();

  if (!flowChart) {
    throw new ApiError(404, "Flowchart not found");
  }
  // @ts-ignore: Ignore the error regarding accessing 'data' on the node
  const leadNode = await LeadSource.findById(flowChart.nodes[0]?.data.source);

  if (!leadNode) throw new ApiError(404, "Lead source not found");

  const sourceCSV = await parseBufferCsvToTable(leadNode?.file.publicId);

  const leadEmailAndUsername = getEmailsAndUsernamesFromTable(sourceCSV);

  const workflow = await Workflow.create({
    userId,
    flowChartId,
    startTime: new Date(),
    status: "pending",
    nodes: flowChart.nodes.map((node: any) => ({
      type: node.type,
      delayDuration: node.type === "Delay" ? node.data?.delay : null,
      source: node.type === "Lead" ? node.data?.source : null,
      templateId: node.type === "Email" ? node.data?.template : null,
    })),
  });

  let accumulatedDelay = 0;

  for (const node of workflow.nodes) {
    if (node.type === "Delay") {
      accumulatedDelay += node.delayDuration!;
    } else if (node.type === "Email") {
      const template = (await Template.findById(
        node.templateId
      ).lean()) as ITemplate;
      if (!template) throw new ApiError(404, "Email template not found");

      await agenda.schedule(
        `in ${Math.floor(accumulatedDelay)} minutes`,
        "send email",
        {
          sourceData: leadEmailAndUsername,
          templateId: node.templateId,
          workflowId: workflow._id,
          subject: template.subject,
          body: template.body,
        }
      );
    }
  }

  return workflow;
};

export {
  createEdge,
  createFlowChart,
  createNode,
  getAllFlowCharts,
  getSingleFlowChartDetails,
  removeFlowChart,
};
