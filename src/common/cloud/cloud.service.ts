import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cloudinary from 'cloudinary';

@Injectable()
export class CloudService {
  constructor(private configService: ConfigService) {
    cloudinary.v2.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'social-app',
  ): Promise<string> {
    try {
      const result = await new Promise<cloudinary.UploadApiResponse>(
        (resolve, reject) => {
          const stream = cloudinary.v2.uploader.upload_stream(
            { folder, resource_type: 'auto' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );
          stream.end(file.buffer);
        },
      );
      return result.secure_url;
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    folder = 'social-app',
  ): Promise<string[]> {
    return Promise.all(files.map((f) => this.uploadImage(f, folder)));
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.v2.uploader.destroy(publicId);
  }

  extractPublicId(url: string): string {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }
}
