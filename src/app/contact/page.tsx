import type { Metadata } from "next";
import schoolInfo from "@/data/school-info.json";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInfoCircle } from "react-icons/fa";

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
              <div className="bg-[#965D03] text-white px-4 py-3">
                <h2 className="font-bold font-bengali text-lg">আমাদের অবস্থান</h2>
              </div>
              <div className="p-0">
                <iframe
                  src="https://maps.google.com/maps?q=Baniyachong+Adarsha+High+School,+Habiganj,+Bangladesh&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="বানিয়াচং আদর্শ উচ্চ বিদ্যালয়"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
