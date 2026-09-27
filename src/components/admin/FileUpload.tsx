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

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("ফাইল সাইজ ১০ মেগাবাইটের বেশি হতে পারবে না");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
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

  const isImage = value && (value.match(/\.(jpeg|jpg|gif|png|webp)$/i) || value.startsWith("/uploads/") || value.startsWith("/images/"));
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
            <div className="w-20 h-20 relative rounded-lg overflow-hidden border border-gray-300 bg-white flex-shrink-0">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : isPdf ? (
            <div className="w-16 h-16 rounded-lg bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
              <FaFilePdf size={32} />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0 font-bold text-xs">
              FILE
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-xs text-green-600 font-bold flex items-center gap-1 mb-1">
              <FaCheckCircle /> ফাইল সফলভাবে আপলোড হয়েছে
            </p>
            <p className="text-xs text-gray-500 font-mono truncate">{value}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs bg-white border border-gray-300 hover:bg-gray-100 px-3 py-1.5 rounded-lg font-bold text-gray-700 transition"
            >
              পরিবর্তন করুন
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition"
              title="মুছে ফেলুন"
            >
              <FaTrash size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
            uploading ? "border-green-400 bg-green-50/50" : "border-gray-300 hover:border-[#06874A] hover:bg-gray-50"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center py-2 text-[#06874A]">
              <FaSpinner className="animate-spin mb-2" size={24} />
              <p className="text-sm font-bold">ফাইল আপলোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-10 h-10 rounded-full bg-green-50 text-[#06874A] flex items-center justify-center mb-2">
                <FaCloudUploadAlt size={22} />
              </div>
              <p className="text-sm font-bold text-gray-700">এখানে ক্লিক করে ফাইল সিলেক্ট করুন</p>
              <p className="text-xs text-gray-400 mt-1">{helpText}</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
    </div>
  );
}
