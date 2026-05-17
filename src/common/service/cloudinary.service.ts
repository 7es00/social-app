import { v2 as cloudinary } from "cloudinary";
import { config } from "../../config";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadToCloudinary = async (
  filePath: string,
  folder: string,
  resourceType: "image" | "video" | "auto" = "auto"
): Promise<{ url: string; publicId: string }> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: resourceType,
  });
  return { url: result.secure_url, publicId: result.public_id };
};

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" = "image"
): Promise<void> => {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

export default cloudinary;
