import { HeavyStorage } from '@/lib/new-storage/storage';
import { getAdminStorage } from '@/lib/firebase-admin';

export async function uploadFile(file: File, path: string): Promise<string> {
  // Switch to new heavy storage (Cloudflare R2 / S3 / Local fallback)
  if (process.env.DATA_PROVIDER === 'new' || process.env.STORAGE_PROVIDER === 's3_compatible' || !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : 'uploads';
    const fileName = path.includes('/') ? path.substring(path.lastIndexOf('/') + 1) : path;
    return await HeavyStorage.upload(buffer, fileName, file.type, folder);
  }

  // Original Firebase fallback
  const bucket = getAdminStorage().bucket();
  const fileRef = bucket.file(path);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fileRef.save(buffer, { contentType: file.type, public: true });
  return `https://storage.googleapis.com/${bucket.name}/${path}`;
}
