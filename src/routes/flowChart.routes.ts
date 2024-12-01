import { Router } from "express";
import {
  createEdge,
  createFlowChart,
  createNode,
  getSingleFlowChartDetails,
  removeFlowChart,
} from "../controller/flowChart.controller.js";

const router = Router();

router.get("/:id", getSingleFlowChartDetails);
router.post("/create-node", createNode);
router.post("/create-edge", createEdge);
router.post("/create-flowchart", createFlowChart);
router.delete("/:flowChartId", removeFlowChart);

export default router;
