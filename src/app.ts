import express, { Express } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import ApiResponse from "./utils/apiResponse.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import errorHandler from "./middleware/errorHandler.middleware.js";
import router from "./routes/index.routes.js";

app.use("/api/v1", router);

app.use(errorHandler);

export default app;
