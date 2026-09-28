export default function GlobalLoading() {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8 font-bengali">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-[#051939]/15 border-t-[#06874A] animate-spin"></div>
      </div>
      <p className="mt-4 text-sm text-gray-500 font-medium animate-pulse">
        পৃষ্ঠাটি লোড হচ্ছে...
      </p>
    </div>
  );
}
