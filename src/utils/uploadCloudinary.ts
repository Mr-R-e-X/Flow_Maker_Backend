import { v2 as cloudinary } from "cloudinary";
import ApiError from "./apiError.js";

interface UploadedFile {
  mimetype: string;
  buffer: Buffer;
}

export interface UploadResponse {
  publicId: string;
  url: string;
}
//  returns: The Base64 representation of the file.
const getBase64 = (file: UploadedFile) => {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};

export const uploadInCloudinary = async (
  file: UploadedFile | null
): Promise<UploadResponse | null> => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    if (!file) return null;
    const uploadedDataResponse = await cloudinary.uploader
      .upload(getBase64(file), { resource_type: "auto" })
      .catch((error) => {
        throw error;
      });
    return {
      publicId: uploadedDataResponse.public_id,
      url: uploadedDataResponse.secure_url,
    };
  } catch (error: any) {
    throw new ApiError(400, error?.message || "Something went wrong!");
  }
};

export const destroyFromCloudinary = async (
  publicId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    if (!publicId) {
      throw new ApiError(400, "Public ID is required to delete a file.");
    }
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== "ok" && result.result !== "not found") {
      throw new ApiError(400, `Failed to delete file: ${result.result}`);
    }

    return {
      success: true,
      message: `File with public ID '${publicId}' deleted successfully.`,
    };
  } catch (error: any) {
    throw new ApiError(400, error?.message || "Something went wrong!");
  }
};

export const getFileBufferFromCloudinary = async (
  publicId: string
): Promise<Buffer> => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const result = await cloudinary.api.resource(publicId, {
      resource_type: "raw",
    });

    if (result && result.secure_url) {
      const fileUrl = result.secure_url;

      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch the file from Cloudinary.");
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } else {
      throw new ApiError(404, "File not found in Cloudinary.");
    }
  } catch (error) {
    throw new ApiError(500, "Error fetching file from Cloudinary.");
  }
};
