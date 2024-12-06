import { NextFunction, Request, Response } from "express";
import { COOKIE_OPTIONS } from "../constants/constants.js";
import { inputValidation } from "../helper/inputValidation.js";
import { CustomRequest } from "../middleware/jwt.middleware.js";
import FlowChart from "../model/flowChart.model.js";
import LeadSource from "../model/leadSources.model.js";
import Template from "../model/template.model.js";
import User from "../model/user.model.js";
import {
  signInManualSchema,
  signUpManualSchema,
  verifyOtpSchema,
} from "../schema/authValidation.schema.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import AsyncHandler from "../utils/asyncHandler.js";
import { sendVerificationEmail } from "../utils/nodemailer.js";

const signUpManual = AsyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { name, email, password } = req.body;
    const result = inputValidation(
      { name, email, password },
      signUpManualSchema
    );
    if (!result.success) {
      //@ts-ignore: Ignore
      throw new ApiError(400, "validation error !", result.error);
    }
    const verifiedUserExists = await User.findOne({
      email: email,
      verfied: true,
    });
    if (verifiedUserExists) {
      throw new ApiError(400, "user already exists with this email !");
    }

    const userExistsWithMail = await User.findOne({ email: email });

    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();

    if (userExistsWithMail) {
      userExistsWithMail.name = name;
      userExistsWithMail.password = password;
      userExistsWithMail.otp = randomOtp;
      userExistsWithMail.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await userExistsWithMail.save();
      const info = await sendVerificationEmail(
        email,
        "Email Verification",
        randomOtp,
        name
      );
      const user = await User.findById(userExistsWithMail._id).select(
        "-password -__v -createdAt -updatedAt"
      );
      return res
        .status(200)
        .json(
          new ApiResponse(
            201,
            "account created successfully ! Do not share the secret OTP with anyone !",
            user
          )
        );
    }

    const user = await User.create({ name, email, password });
    user.otp = randomOtp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    const info = await sendVerificationEmail(
      email,
      "Email Verification",
      randomOtp,
      name
    );
    const createdUser = await User.findById(user._id).select(
      "-password -__v -createdAt -updatedAt"
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          201,
          "account created successfully ! Do not share the secret OTP with anyone !",
          createdUser
        )
      );
  }
);

const signInManual = AsyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { email, password } = req.body;
    const result = inputValidation({ email, password }, signInManualSchema);
    if (!result.success) {
      //@ts-ignore: Ignore
      throw new ApiError(400, "validation error !", result.error);
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new ApiError(400, "user does not exist with this email !");
    }
    if (!user.verified) {
      throw new ApiError(400, "user is not verified !");
    }
    if (!(await user.comparePassword(password))) {
      throw new ApiError(400, "invalid credentials !");
    }
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
      .cookie("accessToken", accessToken, COOKIE_OPTIONS)
      .json(new ApiResponse(200, "Logged In Successfully!"));
  }
);

const verifyUser = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { otp } = req.body;
    const result = inputValidation({ otp }, verifyOtpSchema);
    if (!result.success) {
      // @ts-ignore: Ignore
      throw new ApiError(400, "validation error !", result.error);
    }
    const user = await User.findById(id).select("+otp +otpExpiry");
    if (!user) {
      throw new ApiError(400, "can not find user !");
    }
    if (user?.verified) {
      throw new ApiError(400, "user is already verified !");
    }
    const isTimeExpired = user.otpExpiry < new Date(Date.now());
    if (isTimeExpired) {
      throw new ApiError(400, "otp has been expired !");
    }
    if (user.otp !== otp) {
      throw new ApiError(400, "invalid otp !");
    }
    user.verified = true;
    await user.save();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          `${user.name} is now verified with email ${user.email} !`
        )
      );
  }
);

const getProfile = AsyncHandler(async (req: CustomRequest, res: Response) => {
  if (!req.user) throw new ApiError(401, "Please login to continue!");

  const user = await User.findById(req.user?._id).select(
    "-password -__v -createdAt -updatedAt -verified"
  );
  const userFlowCharts = await FlowChart.aggregate([
    {
      $match: {
        userId: user._id,
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        leadSource: 1,
        nodes: 1,
        edges: 1,
      },
    },
  ]).sort({ createdAt: -1 });
  const userTemplates = await Template.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .select("-__v");
  const userLeads = await LeadSource.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .select("-__v");
  return res.status(200).json(
    new ApiResponse(200, "Success!", {
      user,
      flows: userFlowCharts,
      templates: userTemplates,
      leads: userLeads,
    })
  );
});

const logOut = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    return res
      .status(200)
      .json(new ApiResponse(200, "Successfully logged out !"));
  }
);

export { getProfile, logOut, signInManual, signUpManual, verifyUser };
