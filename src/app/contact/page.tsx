import type { Metadata } from "next";
import schoolInfo from "@/data/school-info.json";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInfoCircle, FaExternalLinkAlt } from "react-icons/fa";

export const metadata: Metadata = {
  title: "যোগাযোগ | বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
};

export default function ContactPage() {
  return (
    <div>
      {/* Page Banner */}
      <div className="bg-[#051939] text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold font-bengali">যোগাযোগ</h1>
          <p className="text-gray-300 font-bengali text-sm mt-1">
            প্রচ্ছদ &rsaquo; যোগাযোগ
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="bg-[#051939] text-white px-4 py-3">
                <h2 className="font-bold font-bengali text-lg">যোগাযোগের ঠিকানা</h2>
              </div>
              <div className="p-6 space-y-5 font-bengali">
                <div className="flex items-start gap-4">
                  <div className="bg-[#051939] text-white p-2.5 rounded-full shrink-0">
                    <FaMapMarkerAlt size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#051939]">ঠিকানা</p>
                    <p className="text-gray-600 text-sm">{schoolInfo.address.bengali}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#051939] text-white p-2.5 rounded-full shrink-0">
                    <FaPhone size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#051939]">ফোন নম্বর</p>
                    <a
                      href={`tel:${schoolInfo.phone}`}
                      className="text-gray-600 text-sm hover:text-[#800505]"
                    >
                      {schoolInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#051939] text-white p-2.5 rounded-full shrink-0">
                    <FaEnvelope size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#051939]">ইমেইল</p>
                    <a
                      href={`mailto:${schoolInfo.email}`}
                      className="text-gray-600 text-sm hover:text-[#800505]"
                    >
                      {schoolInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#051939] text-white p-2.5 rounded-full shrink-0">
                    <FaInfoCircle size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#051939]">EIIN ও স্কুল কোড</p>
                    <p className="text-gray-600 text-sm">
                      EIIN: {schoolInfo.eiin} | স্কুল কোড: {schoolInfo.schoolCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#1877F2] text-white p-2.5 rounded-full shrink-0">
                    <FaFacebook size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#051939]">ফেসবুক পেজ</p>
                    <a
                      href={schoolInfo.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1877F2] text-sm hover:underline"
                    >
                      ফেসবুকে আমাদের ফলো করুন
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-[#06874A] text-white px-4 py-3">
                <h2 className="font-bold font-bengali text-lg">অফিস সময়সূচি</h2>
              </div>
              <div className="p-4 font-bengali text-sm">
                <table className="w-full">
                  <tbody>
                    {[
                      ["রবিবার - বৃহস্পতিবার", "সকাল ৯:০০ — বিকাল ৪:০০"],
                      ["শুক্রবার", "বন্ধ"],
                      ["শনিবার", "বন্ধ"],
                    ].map(([day, time]) => (
                      <tr key={day} className="border-b border-gray-100">
                        <td className="py-2.5 text-[#051939] font-medium">{day}</td>
                        <td className="py-2.5 text-gray-600 text-right">{time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Map */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-[#965D03] text-white px-4 py-3 flex items-center justify-between">
                <h2 className="font-bold font-bengali text-lg">আমাদের অবস্থান</h2>
                <a
                  href="https://maps.google.com/?q=24.5315531,91.3593032"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition flex items-center gap-1.5 font-bengali"
                  title="গুগল ম্যাপে দেখুন"
                >
                  <FaMapMarkerAlt size={11} />
                  <span>গুগল ম্যাপে খুলুন</span>
                  <FaExternalLinkAlt size={9} />
                </a>
              </div>
              <div className="p-0">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3637.288!2d91.357114!3d24.531553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDMxJzUzLjYiTiA5McKwMjEnMzMuNSJF!5e0!3m2!1sen!2sbd!4v1710000000000"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="বানিয়াচং আদর্শ উচ্চ বিদ্যালয়"
                />
              </div>
              <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-600 font-bengali gap-2">
                <div>
                  <span>লোকেশন কোড (Plus Code): </span>
                  <strong className="text-[#051939] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-gray-200">
                    G9J5+JJ4, Baniachong
                  </strong>
                </div>
                <div className="text-gray-500">
                  অক্ষাংশ/দ্রাঘিমাংশ: <span className="font-mono">24.5315° N, 91.3593° E</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
