import { NextFunction, Request, Response } from "express";
import ApiResponse from "../utils/apiResponse.js";
import AsyncHandler from "../utils/asyncHandler.js";

const healthCheck = AsyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    return res
      .status(200)
      .json(new ApiResponse(200, "Success! Everything is fine!"));
  }
);

export { healthCheck };
