"use client";
import Link from "next/link";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaExternalLinkAlt,
  FaGithub,
  FaLinkedin,
  FaYoutube,
  FaCode,
  FaGraduationCap,
} from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

export default function Footer() {
  const { t, language } = useLanguage();

  const officialLinks = [
    { name: t("জাতীয় ওয়েব পোর্টাল", "National Web Portal"), url: "https://bangladesh.gov.bd/" },
    { name: t("এডুকেশন ফলাফল", "Education Results"), url: "http://www.educationboardresults.gov.bd/" },
    { name: t("মাধ্যমিক ও উচ্চ শিক্ষা", "Secondary & Higher Ed"), url: "https://www.dshe.gov.bd/" },
    { name: t("ব্যানবেইস (BANBEIS)", "BANBEIS Portal"), url: "http://www.banbeis.gov.bd/" },
    { name: t("শিক্ষক বাতায়ন", "Teachers Portal"), url: "https://www.teachers.gov.bd/" },
    { name: t("মুক্তপাঠ", "Muktopaath"), url: "https://www.muktopaath.gov.bd/" },
    { name: t("কিশোর বাতায়ন", "Konnect Portal"), url: "https://www.kishore.gov.bd/" },
    { name: t("পাঠ্যবই (NCTB)", "NCTB Textbooks"), url: "https://nctb.gov.bd/" },
  ];

  const quickLinks = [
    { name: t("প্রতিষ্ঠানের ইতিহাস", "History"), href: "/about" },
    { name: t("সকল শিক্ষকমণ্ডলী", "All Faculty"), href: "/administration/all-teachers" },
    { name: t("প্রাক্তন শিক্ষকবৃন্দ", "Former Teachers"), href: "/administration/former-staff" },
    { name: t("কর্মচারী বৃন্দ", "Staff Members"), href: "/administration/staff" },
    { name: t("কৃতি শিক্ষার্থীবৃন্দ", "Outstanding Students"), href: "/alumni" },
    { name: t("নোটিশ বোর্ড", "Notice Board"), href: "/notices" },
    { name: t("ক্লাস রুটিন", "Class Routine"), href: "/academics/routine" },
    { name: t("পরীক্ষার ফলাফল", "Results"), href: "/academics/results" },
    { name: t("ফটোগ্যালারী", "Photo Gallery"), href: "/gallery/photos" },
    { name: t("যোগাযোগ", "Contact Us"), href: "/contact" },
  ];

  const dev = {
    name: "Swadheen Islam Robi",
    nameBn: "স্বাধীন ইসলাম রবি",
    institution: "Leading University (CSE), Sylhet",
    institutionBn: "লিডিং ইউনিভার্সিটি (সিএসই), সিলেট",
    school: "Baniyachong Adarsha High School (SSC-2018)",
    schoolBn: "বানিয়াচং আদর্শ উচ্চ বিদ্যালয় (এসএসসি-২০১৮)",
    github: "https://github.com/swadheen01",
    linkedin: "https://linkedin.com/in/swadheen01",
    facebook: "https://facebook.com/sherlock.sir1",
    youtube: "https://youtube.com/@swadheen01",
    email: "mailto:contactwith.swadheen@gmail.com",
  };

  return (
    <footer className="bg-[#111622] text-white border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* School Info */}
          <div className="lg:col-span-1">
            <h3 className="text-base font-bold mb-3 text-white border-b-2 border-[#800505] pb-2">
              {t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়", "Baniyachong Adarsha High School")}
            </h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p className="flex items-start gap-1.5">
                <FaMapMarkerAlt className="text-[#800505] mt-0.5 shrink-0" />
                <span>{t("বানিয়াচং, হবিগঞ্জ।", "Baniyachong, Habiganj.")}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <FaPhone className="text-[#800505] shrink-0" />
                <a href="tel:+8801309129344" className="hover:text-white transition-colors">
                  +8801309-129344
                </a>
              </p>
              <p className="flex items-center gap-1.5">
                <FaEnvelope className="text-[#800505] shrink-0" />
                <a href="mailto:bah129344s@gmail.com" className="hover:text-white transition-colors truncate">
                  bah129344s@gmail.com
                </a>
              </p>
              <p className="text-gray-400 text-xs pt-1">
                EIIN: 129344 | {t("কোড: ১৯০৩", "Code: 1903")}
              </p>
            </div>
            <div className="mt-3">
              <a
                href="https://www.facebook.com/profile.php?id=100048911620274"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#1877F2] text-white text-[11px] px-2.5 py-1 rounded-lg hover:bg-blue-600 transition-colors shadow"
              >
                <FaFacebook /> {t("ফেসবুক পেজ", "Facebook Page")}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-bold mb-3 text-white border-b-2 border-[#06874A] pb-2">
              {t("প্রয়োজনীয় লিংক", "Quick Links")}
            </h3>
            <ul className="space-y-1.5">
              {quickLinks.map((link) => (
                <li key={link.href + link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white text-sm transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="text-[#06874A] group-hover:translate-x-1 transition-transform">›</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Links */}
          <div>
            <h3 className="text-base font-bold mb-3 text-white border-b-2 border-[#965D03] pb-2">
              {t("গুরুত্বপূর্ণ বাতায়ন", "Official Portals")}
            </h3>
            <ul className="space-y-1.5">
              {officialLinks.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white text-sm transition-colors flex items-center gap-1.5 group"
                  >
                    <FaExternalLinkAlt className="text-[10px] text-gray-500 group-hover:text-white shrink-0" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer Information */}
          <div>
            <h3 className="text-base font-bold mb-3 text-white border-b-2 border-emerald-500 pb-2">
              {t("ডেভেলপার তথ্য", "Developer Info")}
            </h3>
            <div className="space-y-2.5">
              <Link
                href="/developer"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition group"
              >
                <img
                  src="/images/developer.png"
                  alt="স্বাধীন ইসলাম রবি"
                  className="w-8 h-8 rounded-full object-cover border border-emerald-400/60 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                    {language === "en" ? dev.name : dev.nameBn}
                  </h4>
                  <p className="text-[10px] text-emerald-400 font-medium">
                    {t("ডেভেলপার", "Developer")}
                  </p>
                </div>
              </Link>

              <p className="text-[11px] text-gray-300 flex items-start gap-1.5 px-0.5 leading-relaxed">
                <FaGraduationCap className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{language === "en" ? dev.institution : dev.institutionBn}</span>
              </p>

              <p className="text-[11px] text-gray-300 flex items-start gap-1.5 px-0.5 leading-relaxed">
                <FaGraduationCap className="text-amber-400 shrink-0 mt-0.5" />
                <span className="text-yellow-200/90 font-medium">
                  {language === "en" ? dev.school : dev.schoolBn}
                </span>
              </p>

              {/* Social Icons / Emojis */}
              <div className="pt-2 border-t border-gray-800/80 flex items-center gap-1.5 flex-wrap">
                <a
                  href={dev.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-black text-gray-300 hover:text-white transition flex items-center justify-center border border-white/10"
                  title="GitHub"
                >
                  <FaGithub size={14} />
                </a>
                <a
                  href={dev.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#0A66C2] text-gray-300 hover:text-white transition flex items-center justify-center border border-white/10"
                  title="LinkedIn"
                >
                  <FaLinkedin size={14} />
                </a>
                <a
                  href={dev.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#1877F2] text-gray-300 hover:text-white transition flex items-center justify-center border border-white/10"
                  title="Facebook"
                >
                  <FaFacebook size={14} />
                </a>
                <a
                  href={dev.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#FF0000] text-gray-300 hover:text-white transition flex items-center justify-center border border-white/10"
                  title="YouTube"
                >
                  <FaYoutube size={14} />
                </a>
                <a
                  href={dev.email}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#EA4335] text-gray-300 hover:text-white transition flex items-center justify-center border border-white/10"
                  title="Email"
                >
                  <FaEnvelope size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div>
            <h3 className="text-base font-bold mb-3 text-white border-b-2 border-blue-500 pb-2">
              {t("বিদ্যালয়ের অবস্থান", "School Location")}
            </h3>
            <div className="rounded-xl overflow-hidden border border-gray-700 aspect-[4/3] bg-gray-800 shadow">
              <iframe
                title="Baniyachong Adarsha High School Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3637.288!2d91.357114!3d24.531553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDMxJzUzLjYiTiA5McKwMjEnMzMuNSJF!5e0!3m2!1sen!2sbd!4v1710000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
              <span>{t("বানিয়াচং (G9J5+JJ4)", "Baniachong (G9J5+JJ4)")}</span>
              <a
                href="https://maps.google.com/?q=24.5315531,91.3593032"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 transition-colors"
                title="Open in Google Maps"
              >
                <span>{t("গুগল ম্যাপে দেখুন", "View Map")}</span>
                <FaExternalLinkAlt className="text-[9px]" />
              </a>
            </div>
          </div>
        </div>

        {/* Clean, Simple Bottom Bar */}
        <div className="border-t border-gray-800/90 mt-10 pt-5 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400 gap-3">
          <p className="text-center md:text-left">
            © ২০২৬ {t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়। সর্বস্বত্ব সংরক্ষিত।", "Baniyachong Adarsha High School. All rights reserved.")}
          </p>

          <p className="flex items-center gap-1.5 text-center md:text-right">
            <span>{t("কারিগরি সহায়তায়:", "Developed by:")}</span>
            <Link
              href="/developer"
              className="text-emerald-400 font-bold hover:underline"
            >
              {language === "en" ? dev.name : dev.nameBn}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
