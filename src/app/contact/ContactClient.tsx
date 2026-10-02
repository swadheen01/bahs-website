"use client";
import schoolInfo from "@/data/school-info.json";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInfoCircle, FaExternalLinkAlt } from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

export default function ContactClient() {
  const { t, language } = useLanguage();

  return (
    <div>
      {/* Page Banner */}
      <div className="bg-[#051939] text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold">
            {t("যোগাযোগ", "Contact Us")}
          </h1>
          <p className="text-gray-300 text-sm mt-1">
            {t("প্রচ্ছদ › যোগাযোগ", "Home › Contact Us")}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 border border-gray-100">
              <div className="bg-[#051939] text-white px-4 py-3">
                <h2 className="font-bold text-lg">
                  {t("যোগাযোগের ঠিকানা", "Contact Address")}
                </h2>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="bg-[#051939] text-white p-2.5 rounded-full shrink-0">
                    <FaMapMarkerAlt size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#051939]">
                      {t("ঠিকানা", "Address")}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {language === "en" ? schoolInfo.address.english : schoolInfo.address.bengali}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#051939] text-white p-2.5 rounded-full shrink-0">
                    <FaPhone size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#051939]">
                      {t("ফোন নম্বর", "Phone Number")}
                    </p>
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
                    <p className="font-semibold text-[#051939]">
                      {t("ইমেইল", "Email")}
                    </p>
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
                    <p className="font-semibold text-[#051939]">
                      {t("EIIN ও স্কুল কোড", "EIIN & School Code")}
                    </p>
                    <p className="text-gray-600 text-sm">
                      EIIN: {schoolInfo.eiin} | {t("স্কুল কোড", "School Code")}: {schoolInfo.schoolCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#1877F2] text-white p-2.5 rounded-full shrink-0">
                    <FaFacebook size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#051939]">
                      {t("ফেসবুক পেজ", "Facebook Page")}
                    </p>
                    <a
                      href={schoolInfo.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1877F2] text-sm hover:underline"
                    >
                      {t("ফেসবুকে আমাদের ফলো করুন", "Follow Us on Facebook")}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
              <div className="bg-[#06874A] text-white px-4 py-3">
                <h2 className="font-bold text-lg">
                  {t("অফিস সময়সূচি", "Office Hours")}
                </h2>
              </div>
              <div className="p-4 text-sm">
                <table className="w-full">
                  <tbody>
                    {[
                      [t("রবিবার - বৃহস্পতিবার", "Sunday - Thursday"), t("সকাল ৯:০০ — বিকাল ৪:০০", "9:00 AM — 4:00 PM")],
                      [t("শুক্রবার", "Friday"), t("বন্ধ", "Closed")],
                      [t("শনিবার", "Saturday"), t("বন্ধ", "Closed")],
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
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
              <div className="bg-[#965D03] text-white px-4 py-3 flex items-center justify-between">
                <h2 className="font-bold text-lg">
                  {t("আমাদের অবস্থান", "Our Location")}
                </h2>
                <a
                  href="https://maps.google.com/?q=24.5315531,91.3593032"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition flex items-center gap-1.5"
                  title={t("গুগল ম্যাপে দেখুন", "View on Google Maps")}
                >
                  <FaMapMarkerAlt size={11} />
                  <span>{t("গুগল ম্যাপে খুলুন", "Open in Google Maps")}</span>
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
                  title="Baniyachong Adarsha High School Map"
                />
              </div>
              <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-600 gap-2">
                <div>
                  <span>{t("লোকেশন কোড (Plus Code): ", "Location Code (Plus Code): ")}</span>
                  <strong className="text-[#051939] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-gray-200">
                    G9J5+JJ4, Baniachong
                  </strong>
                </div>
                <div className="text-gray-500">
                  {t("অক্ষাংশ/দ্রাঘিমাংশ: ", "Coordinates: ")}
                  <span className="font-mono">24.5315° N, 91.3593° E</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
