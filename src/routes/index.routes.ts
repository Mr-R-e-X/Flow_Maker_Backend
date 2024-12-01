import { RequestHandler, Router } from "express";
import { healthCheck } from "../controller/healthCheck.controller.js";
import UserRouter from "./user.routes.js";
import TemplateRouter from "./template.routes.js";
import FlowChartRouter from "./flowChart.routes.js";
import LeadSourceRouter from "./leadSource.routes.js";
import { authenticateUser } from "../middleware/jwt.middleware.js";

const router = Router();

router.get("/", healthCheck);

router.use("/user", UserRouter);
router.use("/template", authenticateUser, TemplateRouter);
router.use("/flowchart", authenticateUser, FlowChartRouter);
router.use("/source", authenticateUser, LeadSourceRouter);

export default router;
