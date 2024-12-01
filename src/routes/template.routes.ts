import { Router } from "express";
import {
  createTemplate,
  getAllTemplates,
  getOneTemplate,
  removeTemplate,
  updateTemplate,
} from "../controller/template.controller.js";

const router = Router();

router.get("/", getAllTemplates);
router.get("/:id", getOneTemplate);
router.post("/", createTemplate);
router.delete("/:id", removeTemplate);
router.patch("/:id", updateTemplate);

export default router;
