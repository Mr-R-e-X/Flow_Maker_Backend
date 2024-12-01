import { Request, Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../middleware/jwt.middleware.js";
const AsyncHandler =
  (
    func: (
      req: Request | CustomRequest,
      res: Response,
      next: NextFunction
    ) => Promise<any>
  ): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export default AsyncHandler;
