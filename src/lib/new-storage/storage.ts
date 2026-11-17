import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

/**
 * MLSC Heavy Storage Provider
 * Supports:
 * 1. Cloudflare R2 ($0 egress fees, 10GB free tier)
 * 2. MinIO (Self-hosted S3)
 * 3. Local filesystem fallback (saves to public/uploads during local dev)
 */

const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 's3_compatible'; // 's3_compatible' | 'local'

const r2AccountId = process.env.R2_ACCOUNT_ID || '';
const endpoint = process.env.R2_ENDPOINT || (r2AccountId ? `https://${r2AccountId}.r2.cloudflarestorage.com` : undefined);
const bucketName = process.env.R2_BUCKET_NAME || process.env.STORAGE_BUCKET || 'mlsc-storage';
const publicBaseUrl = process.env.R2_PUBLIC_URL || '';

// S3-compatible client (works with Cloudflare R2, MinIO, Wasabi, etc.)
const s3 = new S3Client({
  region: 'auto',
  endpoint: endpoint,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export class HeavyStorage {
  /**
   * Upload buffer or file to heavy storage
   */
  static async upload(fileBuffer: Buffer, fileName: string, contentType: string, folder = 'general'): Promise<string> {
    const key = `${folder}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // 1. Local Fallback if no cloud storage keys configured
    if (STORAGE_PROVIDER === 'local' || !process.env.R2_ACCESS_KEY_ID) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const localFilePath = path.join(uploadDir, path.basename(key));
      fs.writeFileSync(localFilePath, fileBuffer);
      return `/uploads/${folder}/${path.basename(key)}`;
    }

    // 2. Cloudflare R2 / S3 upload
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3.send(command);

    if (publicBaseUrl) {
      return `${publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }
    return `/${key}`;
  }

  /**
   * Generate a presigned URL for direct secure client upload
   */
  static async getPresignedUploadUrl(fileName: string, contentType: string, folder = 'resumes'): Promise<{ uploadUrl: string; fileUrl: string }> {
    const key = `${folder}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    if (!process.env.R2_ACCESS_KEY_ID) {
      // Return local upload endpoint
      return {
        uploadUrl: `/api/storage/upload`,
        fileUrl: `/uploads/${key}`,
      };
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    const fileUrl = publicBaseUrl ? `${publicBaseUrl.replace(/\/$/, '')}/${key}` : `/${key}`;

    return { uploadUrl, fileUrl };
  }
}
