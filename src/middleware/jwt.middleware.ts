import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";

export interface CustomUser {
  _id: string;
  email: string;
  name: string;
  role: string;
}

export interface CustomRequest extends Request {
  user?: CustomUser;
}

export const authenticateUser: RequestHandler = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(400, "Please login to continue!");
    }
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as CustomUser;

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
