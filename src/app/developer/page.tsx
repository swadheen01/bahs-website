"use client";
import Link from "next/link";
import Image from "next/image";
import {
  FaGithub,
  FaLinkedin,
  FaFacebook,
  FaYoutube,
  FaEnvelope,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaCode,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

export default function DeveloperPage() {
  const { t, language } = useLanguage();

  const dev = {
    name: "Swadheen Islam Robi",
    nameBn: "স্বাধীন ইসলাম রবি",
    role: "Developer",
    roleBn: "ডেভেলপার",
    institution: "Leading University, Sylhet",
    institutionBn: "লিডিং ইউনিভার্সিটি, সিলেট",
    department: "Department of Computer Science & Engineering (CSE)",
    departmentBn: "কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং (CSE) বিভাগ",
    email: "contactwith.swadheen@gmail.com",
    github: "https://github.com/swadheen01",
    linkedin: "https://linkedin.com/in/swadheen01",
    facebook: "https://facebook.com/sherlock.sir1",
    youtube: "https://youtube.com/@swadheen01",
  };

  const socialLinks = [
    {
      name: "GitHub",
      url: dev.github,
      icon: <FaGithub size={24} />,
      color: "bg-[#24292e] text-white hover:bg-black hover:shadow-gray-700/50",
    },
    {
      name: "LinkedIn",
      url: dev.linkedin,
      icon: <FaLinkedin size={24} />,
      color: "bg-[#0A66C2] text-white hover:bg-[#084e96] hover:shadow-blue-600/50",
    },
    {
      name: "Facebook",
      url: dev.facebook,
      icon: <FaFacebook size={24} />,
      color: "bg-[#1877F2] text-white hover:bg-[#1464c9] hover:shadow-blue-500/50",
    },
    {
      name: "YouTube",
      url: dev.youtube,
      icon: <FaYoutube size={24} />,
      color: "bg-[#FF0000] text-white hover:bg-[#cc0000] hover:shadow-red-600/50",
    },
    {
      name: "Email",
      url: `mailto:${dev.email}`,
      icon: <FaEnvelope size={24} />,
      color: "bg-[#EA4335] text-white hover:bg-[#c5372c] hover:shadow-red-500/50",
    },
  ];

  const techStack = [
    "Next.js 16 (App Router)",
    "TypeScript",
    "Tailwind CSS",
    "Supabase PostgreSQL",
    "Iron Session",
    "Dual Persistence",
    "Bilingual i18n",
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-[#051939] via-[#09224d] to-[#051939] text-white py-12 px-4 ${language === "bn" ? "font-bengali" : "font-sans"}`}>
      <div className="container mx-auto max-w-3xl">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-white bg-white/10 px-4 py-2 rounded-xl border border-white/10 mb-8 backdrop-blur-md transition-colors"
        >
          <FaArrowLeft /> {t("হোমপেজে ফিরে যান", "Back to Homepage")}
        </Link>

        {/* Main Developer Profile Card */}
        <div className="glossy-card bg-white/95 text-gray-800 rounded-3xl p-6 md:p-10 shadow-2xl border border-white/60 relative overflow-hidden text-center md:text-left">
          {/* Subtle gradient banner with Developer Tag on green area */}
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-[#051939] via-[#06874A] to-[#800505] flex items-center justify-end px-6 md:px-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/30 text-white text-xs font-bold tracking-wider backdrop-blur-md shadow-sm font-mono">
              <FaCode className="text-yellow-300" size={13} />
              <span>Developer</span>
            </span>
          </div>

          <div className="relative pt-6 md:pt-8 flex flex-col md:flex-row items-center md:items-start gap-7">
            {/* Developer Image from /images/developer.png */}
            <div className="relative group shrink-0">
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden p-1 bg-gradient-to-tr from-[#051939] via-[#06874A] to-emerald-400 shadow-2xl border-4 border-white relative">
                <Image
                  src="/images/developer.png"
                  alt={dev.name}
                  fill
                  className="object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                  priority
                  sizes="(max-width: 768px) 150px, 180px"
                />
              </div>
              <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#06874A] text-white text-[11px] font-bold px-3 py-0.5 rounded-full border-2 border-white shadow whitespace-nowrap">
                {t("ডেভেলপার", "Developer")}
              </span>
            </div>

            {/* Basic Info - placed cleanly below the banner */}
            <div className="flex-1 mt-6 md:mt-0 md:pt-16">
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#051939] tracking-tight">
                {language === "en" ? dev.name : dev.nameBn}
              </h1>

              {/* Institution details */}
              <div className="mt-3.5 space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <FaGraduationCap className="text-[#06874A] shrink-0" size={18} />
                  <span className="font-bold text-gray-800">
                    {language === "en" ? dev.institution : dev.institutionBn}
                  </span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <FaMapMarkerAlt className="text-[#800505] shrink-0" size={16} />
                  <span>
                    {language === "en" ? dev.department : dev.departmentBn}
                  </span>
                </div>
              </div>

              {/* Connected Icons / Direct Click Links (Account text hidden!) */}
              <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center md:justify-start gap-3">
                {socialLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ${s.color} border border-white/20`}
                    title={`${s.name} - ক্লিক করে সরাসরি প্রোফাইলে যান`}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="mt-10 p-5 bg-gradient-to-r from-gray-50 to-blue-50/40 rounded-2xl border border-gray-200 text-left">
            <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
              <FaCheckCircle className="text-[#06874A]" />
              {t(
                "বানিয়াচং আদর্শ উচ্চ বিদ্যালয় অফিসিয়াল ওয়েব সিস্টেম",
                "Baniyachong Adarsha High School Official Web System"
              )}
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {t(
                "বানিয়াচং আদর্শ উচ্চ বিদ্যালয়ের এই পূর্ণাঙ্গ আধুনিক ওয়েব পোর্টালটি বিশেষ দক্ষতার সাথে তৈরি করেছেন স্বাধীন ইসলাম রবি। এতে রয়েছে শক্তিশালী এডমিন প্যানেল, শিক্ষক ও শিক্ষার্থী পোর্টাল, ডাইনামিক স্লাইডার, ফাইল আপলোড ও রিয়েল-টাইম বাংলা/ইংরেজি ট্রান্সলেশন।",
                "This official comprehensive web portal for Baniyachong Adarsha High School was developed by Swadheen Islam Robi, featuring full admin management, faculty and student portals, dynamic banner uploads, and instant bilingual localization."
              )}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-[10px] font-bold bg-white text-gray-700 px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
