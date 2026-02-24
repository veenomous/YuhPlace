import { createClient } from '@/lib/supabase/client';

const BUCKET = 'listing-images';

/**
 * Upload an array of image files to Supabase Storage and return their public URLs.
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

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
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
