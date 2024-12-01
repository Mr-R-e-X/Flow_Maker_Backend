import { Router } from "express";
import {
  deleteLeadSource,
  getAllLeadSources,
  getPaginatedCsvData,
  uploadLeadSource,
} from "../controller/leadSource.controller.js";
import { CSVUpload } from "../middleware/fileupload.middleware.js";

const router = Router();

router.get("/", getAllLeadSources);
router.post("/upload", CSVUpload, uploadLeadSource);
router.get("/:id", getPaginatedCsvData);
router.delete("/:id", deleteLeadSource);

export default router;
