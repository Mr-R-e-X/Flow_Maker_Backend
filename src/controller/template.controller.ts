import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import AsyncHandler from "../utils/asyncHandler.js";
import Template from "../model/template.model.js";
import { CustomRequest } from "../middleware/jwt.middleware.js";

const getAllTemplates = AsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const templates = await Template.find({ userId: req.user?._id })
      .select("-__v")
      .sort({ createdAt: -1 }); 
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Successfully fetched the templates !", templates)
      );
  }
);

const removeTemplate = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const template = await Template.findByIdAndDelete(id);
    if (!template) {
      throw new ApiError(400, "can not find template !");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "Successfully deleted the template !"));
  }
);

const getOneTemplate = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const template = await Template.findById(id);
    if (!template) {
      throw new ApiError(400, "can not find template !");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Successfully fetched the template !", template)
      );
  }
);

const createTemplate = AsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { name, subject, body } = req.body;
    const templateExists = await Template.findOne({
      name,
      userId: req.user?._id,
    });
    if (templateExists) {
      throw new ApiError(
        400,
        "Can not create template with same name, please change name or delete old template."
      );
    }
    const template = await Template.create({
      name,
      subject,
      body,
      userId: req.user?._id,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Successfully created the template !", template)
      );
  }
);

const updateTemplate = AsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, subject, body } = req.body;
    const template = await Template.findByIdAndUpdate(
      id,
      { name, subject, body },
      { new: true }
    );
    if (!template) {
      throw new ApiError(400, "can not find template !");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Successfully updated the template !", template)
      );
  }
);

export {
  getAllTemplates,
  removeTemplate,
  getOneTemplate,
  createTemplate,
  updateTemplate,
};
