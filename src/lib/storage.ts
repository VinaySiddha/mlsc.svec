import { getAdminStorage } from '@/lib/firebase-admin';

export async function uploadFile(file: File, path: string): Promise<string> {
  const bucket = getAdminStorage().bucket();
  const fileRef = bucket.file(path);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fileRef.save(buffer, { contentType: file.type, public: true });
  return `https://storage.googleapis.com/${bucket.name}/${path}`;
}
