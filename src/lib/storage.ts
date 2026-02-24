import { createClient } from '@/lib/supabase/client';

const BUCKET = 'listing-images';
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 0.8;
const MAX_FILE_SIZE = 500 * 1024; // 500 KB — compress if larger

/**
 * Compress an image file using Canvas API.
 * Resizes to fit within MAX_WIDTH x MAX_HEIGHT and outputs as JPEG.
 */
async function compressImage(file: File): Promise<File> {
  // Skip small files and non-images
  if (file.size <= MAX_FILE_SIZE || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Scale down proportionally
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
              type: 'image/jpeg',
            }));
          } else {
            // Compressed is bigger (rare), keep original
            resolve(file);
          }
        },
        'image/jpeg',
        QUALITY,
      );
    };
    img.onerror = () => resolve(file); // fallback to original on error
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload an array of image files to Supabase Storage and return their public URLs.
 * Images are automatically compressed before upload.
 * Files are stored under: {folder}/{listingId}/{index}.{ext}
 */
export async function uploadImages(
  files: File[],
  folder: string,
  listingId: string,
): Promise<{ urls: string[]; error: string | null }> {
  if (files.length === 0) return { urls: [], error: null };

  const supabase = createClient();
  const urls: string[] = [];

  // Compress all images in parallel
  const compressed = await Promise.all(files.map(compressImage));

  for (let i = 0; i < compressed.length; i++) {
    const file = compressed[i];
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${folder}/${listingId}/${i}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true });

    if (uploadError) {
      return { urls: [], error: `Failed to upload image: ${uploadError.message}` };
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return { urls, error: null };
}
