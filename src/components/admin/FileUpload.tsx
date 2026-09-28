"use client";
import { useState, useRef } from "react";
import { FaCloudUploadAlt, FaTrash, FaSpinner, FaCheckCircle, FaFilePdf } from "react-icons/fa";

interface FileUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  required?: boolean;
  helpText?: string;
}

async function compressImageIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type.includes("svg") || file.size < 600 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = document.createElement("img");
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const maxDim = 1600;

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
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.82
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export default function FileUpload({
  label,
  value,
  onChange,
  accept = "image/*",
  required = false,
  helpText = "কম্পিউটার বা মোবাইল থেকে ফাইল সিলেক্ট করুন"
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 25MB before compression)
    if (file.size > 25 * 1024 * 1024) {
      setError("ফাইল সাইজ ২৫ মেগাবাইটের বেশি হতে পারবে না");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const fileToUpload = await compressImageIfNeeded(file);
      const formData = new FormData();
      formData.append("file", fileToUpload);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onChange(data.url);
      } else {
        setError(data.error || "আপলোড ব্যর্থ হয়েছে");
      }
    } catch (err) {
      setError("সার্ভার এরর! ফাইল আপলোড করা যায়নি।");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
    setError(null);
  };

  const isImage = value && (value.match(/\.(jpeg|jpg|gif|png|webp)$/i) || value.startsWith("/uploads/") || value.startsWith("/images/") || value.startsWith("data:image"));
  const isPdf = value && value.match(/\.(pdf)$/i);

  return (
    <div className="space-y-2 font-bengali">
      <label className="block text-sm font-bold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
          {isImage ? (
            <div className="w-20 h-20 relative rounded-lg overflow-hidden border border-gray-300 bg-white shrink-0">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : isPdf ? (
            <div className="w-16 h-16 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <FaFilePdf size={32} />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 font-bold text-xs">
              FILE
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-xs text-green-600 font-bold flex items-center gap-1 mb-1">
              <FaCheckCircle /> ফাইল আপলোড সম্পন্ন হয়েছে
            </p>
            <p className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-xs">
              {value.startsWith("data:") ? "সফলভাবে এনকোড করা ছবি" : value}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              পরিবর্তন
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs bg-red-50 border border-red-200 text-red-600 p-2 rounded-lg hover:bg-red-100 transition"
              title="মুছে ফেলুন"
            >
              <FaTrash size={12} />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-5 text-center transition flex flex-col items-center justify-center gap-2 cursor-pointer ${
              uploading ? "border-green-400 bg-green-50/50" : "border-gray-300 hover:border-[#06874A] hover:bg-gray-50"
            }`}
          >
            {uploading ? (
              <>
                <FaSpinner className="animate-spin text-[#06874A]" size={28} />
                <span className="text-sm font-bold text-[#06874A]">ফাইল প্রসেসিং ও আপলোড হচ্ছে...</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#06874A] flex items-center justify-center">
                  <FaCloudUploadAlt size={22} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-gray-700">ফাইল নির্বাচন করতে ক্লিক করুন</span>
                  <p className="text-xs text-gray-500">{helpText}</p>
                </div>
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded-lg border border-red-200">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
