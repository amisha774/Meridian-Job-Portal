import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { cloudinary, hasCloudinaryConfig } from '../config/cloudinary.ts';

const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads');

export interface UploadResult {
  url: string;
  originalName: string;
  size: number;
}

export async function uploadFileBuffer(
  file: Express.Multer.File,
  folder: 'avatars' | 'logos' | 'resumes'
): Promise<UploadResult> {
  if (hasCloudinaryConfig) {
    const resourceType = folder === 'resumes' ? 'raw' : 'image';
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `meridian/${folder}`,
          resource_type: resourceType,
          public_id: `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`,
        },
        (err, res) => {
          if (err || !res) {
            reject(err || new Error('Cloudinary upload failed'));
            return;
          }
          resolve(res);
        }
      );
      stream.end(file.buffer);
    });

    return {
      url: result.secure_url,
      originalName: file.originalname,
      size: file.size,
    };
  }

  // Local persistent upload storage fallback
  const targetDir = path.join(UPLOADS_ROOT, folder);
  await fs.mkdir(targetDir, { recursive: true });

  const ext = path.extname(file.originalname).toLowerCase() || (folder === 'resumes' ? '.pdf' : '.png');
  const safeName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  const fullPath = path.join(targetDir, safeName);

  await fs.writeFile(fullPath, file.buffer);

  return {
    url: `/uploads/${folder}/${safeName}`,
    originalName: file.originalname,
    size: file.size,
  };
}
