import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import AsyncHandler from "../utils/asyncHandler.js";
import {
  destroyFromCloudinary,
  getFileBufferFromCloudinary,
  uploadInCloudinary,
} from "../utils/uploadCloudinary.js";
import LeadSource from "../model/leadSources.model.js";
import { Readable } from "stream";
import csvParser from "csv-parser";
import { CustomRequest } from "../middleware/jwt.middleware.js";

export const bufferToStream = (buffer: Buffer): Readable => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

const ParseCSVandPaginate = (buffer: Buffer, page: number, limit: number) => {
  const offset = (page - 1) * limit;
  const rows: Record<string, string>[] = [];
  let rowCount = 0;

  return new Promise<any>((resolve, reject) => {
    bufferToStream(buffer)
      .pipe(csvParser())
      .on("data", (row) => {
        if (rowCount >= offset && rowCount < offset + limit) {
          rows.push(row);
        }
        rowCount++;
      })
      .on("end", () => {
        const totalPages = Math.ceil(rowCount / limit);
        resolve({
          currentPage: page,
          totalPages,
          totalRows: rowCount,
          rowsPerPage: limit,
          data: rows,
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

const uploadLeadSource = AsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { name } = req.body;
    const CSV_LEAD = req.file;

    if (!CSV_LEAD || !name) {
      throw new ApiError(400, "Please provide a CSV file and a name.");
    }

    const leadSourceExists = await LeadSource.findOne({
      name: name,
      userId: new mongoose.Types.ObjectId(req.user?._id),
    });

    if (leadSourceExists) {
      throw new ApiError(
        400,
        "Can not create lead source with same name, please change name or delete old lead source."
      );
    }

    const file = await uploadInCloudinary(CSV_LEAD);
    const leadSource = await LeadSource.create({
      name,
      file,
      userId: new mongoose.Types.ObjectId(req.user?._id),
    });

    if (!leadSource) {
      throw new ApiError(400, "can not create lead source");
    }
    const source = await LeadSource.findById(leadSource._id).select(
      "-__v -createdAt -updatedAt -userId"
    );

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;

    const fileBuffer = CSV_LEAD.buffer;
    const paginatedData = await ParseCSVandPaginate(fileBuffer, page, limit);

    return res.status(201).json(
      new ApiResponse(201, "Lead source uploaded and CSV parsed successfully", {
        source,
        paginatedData,
      })
    );
  }
);

const getPaginatedCsvData = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;

    const leadSource = await LeadSource.findById(id);
    if (!leadSource) {
      throw new ApiError(400, "can not find lead source !");
    }
    const fileBuffer = await getFileBufferFromCloudinary(
      leadSource.file.publicId
    );
    const paginatedData = await ParseCSVandPaginate(fileBuffer, page, limit);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Successfully Parsed the CSV file !",
          paginatedData
        )
      );
  }
);

const deleteLeadSource = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const leadSource = await LeadSource.findById(id);
    if (!leadSource) {
      throw new ApiError(400, "can not find lead source !");
    }
    await destroyFromCloudinary(leadSource.file.publicId);
    await LeadSource.findByIdAndDelete(id);
    res
      .status(200)
      .json(new ApiResponse(200, "Lead source deleted successfully"));
  }
);

const getAllLeadSources = AsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const leadSources = await LeadSource.find({ userId: req.user?._id })
      .sort({ createdAt: -1 })
      .select("-__v -createdAt -updatedAt -userId");

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Successfully fetched all lead sources",
          leadSources
        )
      );
  }
);

export {
  uploadLeadSource,
  getPaginatedCsvData,
  deleteLeadSource,
  getAllLeadSources,
};
