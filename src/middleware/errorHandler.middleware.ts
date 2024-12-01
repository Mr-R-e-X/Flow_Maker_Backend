import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import ApiError from "../utils/apiError.js";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? 400 : 500;
    if (!error.statusCode) error.statusCode = 500;
    const message = error.message || "Something went wrong!";
    error = new ApiError(statusCode, message, error.errors || [], error.stack);
  }

  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };
  res.status(error.statusCode).json(response);
};

export default errorHandler;
