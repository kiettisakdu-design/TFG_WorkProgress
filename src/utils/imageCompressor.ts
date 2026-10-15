/**
 * Utility for client-side image compression and auto-resizing
 * Prevents HTTP 413 Payload Too Large and Cloud Run / Proxy request limits.
 * Reduces 10MB camera photos to ~150KB - 300KB while preserving visual clarity for AI Vision.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export async function compressImageFile(
  file: File,
  maxDimension = 1280,
  quality = 0.82
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      return reject(new Error('ไฟล์ที่เลือกไม่ใช่รูปภาพที่รองรับ (ต้องเป็น JPG, PNG, WEBP)'));
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์รูปภาพ'));
    };

    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) {
        return reject(new Error('ไม่พบข้อมูลรูปภาพ'));
      }

      // If SVG or very small file (< 100KB), return as is
      if (file.type === 'image/svg+xml' || file.size < 100 * 1024) {
        return resolve({
          dataUrl: src,
          originalSize: file.size,
          compressedSize: file.size,
          width: 0,
          height: 0,
        });
      }

      const img = new Image();

      img.onerror = () => {
        reject(new Error('ไม่สามารถประมวลผลรูปภาพนี้ได้ รูปแบบไฟล์อาจเสียหาย'));
      };

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Proportional resize to fit inside maxDimension x maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        // Draw onto HTML5 Canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Canvas unsupported fallback
          return resolve({
            dataUrl: src,
            originalSize: file.size,
            compressedSize: file.size,
            width,
            height,
          });
        }

        // Better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with controlled quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        // Approximate size of base64
        const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);

        resolve({
          dataUrl: compressedDataUrl,
          originalSize: file.size,
          compressedSize,
          width,
          height,
        });
      };

      img.src = src;
    };

    reader.readAsDataURL(file);
  });
}
