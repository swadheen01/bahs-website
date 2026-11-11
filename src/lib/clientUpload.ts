export const MAX_CLIENT_SOURCE_IMAGE_BYTES = 25 * 1024 * 1024;
export const MAX_CLIENT_NON_IMAGE_BYTES = 5 * 1024 * 1024;
export const TARGET_IMAGE_COMPRESS_THRESHOLD_BYTES = 250 * 1024;
export const MAX_UPLOAD_FINAL_BYTES = 5 * 1024 * 1024;

function compressCanvasToFile(
  img: HTMLImageElement,
  fileName: string,
  maxDim: number,
  quality: number
): Promise<File | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    let { width, height } = img;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(null);
      return;
    }

    // Fill white background before JPEG export in case source image had transparency
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        resolve(
          new File([blob], fileName.replace(/\.[^.]+$/, "") + ".jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          })
        );
      },
      "image/jpeg",
      quality
    );
  });
}

export async function compressImageIfNeeded(file: File): Promise<File> {
  if (
    !file.type.startsWith("image/") ||
    file.type.includes("svg") ||
    file.size <= TARGET_IMAGE_COMPRESS_THRESHOLD_BYTES
  ) {
    return file;
  }

  return new Promise((resolve) => {
    const img = document.createElement("img");
    const reader = new FileReader();

    reader.onload = async (e) => {
      img.onload = async () => {
        let candidate = await compressCanvasToFile(img, file.name, 1600, 0.85);
        if (candidate && candidate.size > MAX_UPLOAD_FINAL_BYTES) {
          const smaller = await compressCanvasToFile(img, file.name, 1280, 0.72);
          if (smaller) candidate = smaller;
        }
        if (candidate && candidate.size < file.size) {
          resolve(candidate);
        } else {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = (e.target?.result as string) || "";
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export async function prepareUploadFile(
  file: File
): Promise<{ file?: File; error?: string }> {
  const isImage = file.type.startsWith("image/");

  if (isImage) {
    if (file.size > MAX_CLIENT_SOURCE_IMAGE_BYTES) {
      return { error: "ছবির সাইজ ২৫ মেগাবাইটের বেশি হতে পারবে না" };
    }
    const processed = await compressImageIfNeeded(file);
    if (processed.size > MAX_UPLOAD_FINAL_BYTES) {
      return {
        error: "কম্প্রেস করার পরও ছবির সাইজ ৫ মেগাবাইটের বেশি। অনুগ্রহ করে ছোট ছবি নির্বাচন করুন।",
      };
    }
    return { file: processed };
  }

  if (file.size > MAX_CLIENT_NON_IMAGE_BYTES) {
    return {
      error: "ফাইলের সাইজ ৫ মেগাবাইটের বেশি হতে পারবে না (PDF/নথি সর্বোচ্চ ৫ MB)",
    };
  }

  return { file };
}
