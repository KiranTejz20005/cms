import axios from 'axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;
const FOLDER = (import.meta.env.VITE_CLOUDINARY_FOLDER as string | undefined) || 'byte-sized-learning';

export type CloudinaryResourceType = 'image' | 'video';

export async function uploadToCloudinary(
  file: File,
  resourceType: CloudinaryResourceType,
  onProgress?: (progress: number) => void
): Promise<{
  url: string;
  path: string;
  filename: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary is not configured: set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET');
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', FOLDER);

  const response = await axios.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt: any) => {
      if (onProgress && evt?.total) {
        const pct = Math.round((evt.loaded * 100) / evt.total);
        onProgress(pct);
      }
    },
  });

  const data = response.data;
  return {
    url: data.secure_url || data.url,
    path: data.public_id,
    filename: data.original_filename || file.name,
    size: data.bytes || file.size,
    contentType: data.resource_type === 'video' ? (file.type || 'video/mp4') : (file.type || `image/${data.format}`),
    uploadedAt: data.created_at || new Date().toISOString(),
  };
}

export function videoPosterUrl(
  publicId: string,
  opts?: { width?: number; height?: number; startOffsetSeconds?: number; aspect?: '9:16' | '16:9' }
): string {
  if (!CLOUD_NAME) throw new Error('Cloudinary cloud name missing');
  const aspect = opts?.aspect || '9:16';
  const width = opts?.width ?? (aspect === '9:16' ? 720 : 1280);
  const height = opts?.height ?? (aspect === '9:16' ? 1280 : 720);
  const so = typeof opts?.startOffsetSeconds === 'number' ? `,so_${Math.max(0, Math.floor(opts!.startOffsetSeconds!))}` : '';
  const transformation = `c_fill,w_${width},h_${height},g_auto${so}`;
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${transformation}/${publicId}.jpg`;
}
