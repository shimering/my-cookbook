import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

/**
 * Compresses an image file from camera or photo library to a lightweight WebP/JPEG data URL.
 */
export async function compressImageToDataUrl(
  imageFile: File,
  options: CompressionOptions = {}
): Promise<string> {
  const defaultOptions = {
    maxSizeMB: 0.35,              // Max ~350KB
    maxWidthOrHeight: 1200,       // Max dimension 1200px
    useWebWorker: true,
    fileType: 'image/webp',
    ...options,
  };

  try {
    const compressedFile = await imageCompression(imageFile, defaultOptions);
    return await imageCompression.getDataUrlFromFile(compressedFile);
  } catch (err) {
    console.warn('Image compression failed, falling back to FileReader:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  }
}
