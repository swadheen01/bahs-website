"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaUser,
  FaUserPlus,
  FaSignOutAlt,
  FaTachometerAlt,
  FaCode,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";
import LanguageToggle from "./LanguageToggle";

export default function Navbar() {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    setCurrentDateTime(new Date());
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const navItems = [
    { label: t("প্রচ্ছদ", "Home"), href: "/" },
    {
      label: t("প্রতিষ্ঠান", "About"),
      href: "#",
      children: [
        { label: t("প্রতিষ্ঠানের ইতিহাস", "History"), href: "/about" },
        { label: t("সভাপতির বাণী", "President's Message"), href: "/about#president" },
        { label: t("প্রধান শিক্ষকের বাণী", "Headmaster's Message"), href: "/about#headmaster" },
      ],
    },
    {
      label: t("প্রশাসন", "Administration"),
      href: "#",
      children: [
        { label: t("ম্যানেজিং কমিটি", "Managing Committee"), href: "/administration/managing-committee" },
        { label: t("সকল শিক্ষকমণ্ডলী", "All Faculty"), href: "/administration/all-teachers" },
        { label: t("প্রাক্তন শিক্ষকবৃন্দ", "Former Teachers"), href: "/administration/former-staff" },
        { label: t("কর্মচারী বৃন্দ", "Staff Members"), href: "/administration/staff" },
      ],
    },
    {
      label: t("একাডেমিক", "Academics"),
      href: "#",
      children: [
        { label: t("ক্লাস রুটিন", "Class Routine"), href: "/academics/routine" },
        { label: t("পরীক্ষার ফলাফল", "Results"), href: "/academics/results" },
        { label: t("প্রশংসাপত্র ডাউনলোড", "Testimonial Download"), href: "/academics/testimonial" },
        { label: t("ছুটির তালিকা", "Holidays"), href: "/academics/holidays" },
      ],
    },
    { label: t("রেজাল্ট", "Results"), href: "/academics/results" },
    { label: t("নোটিশ", "Notices"), href: "/notices" },
    { label: t("গ্যালারী", "Gallery"), href: "/gallery/photos" },
    { label: t("যোগাযোগ", "Contact"), href: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const dashboardHref = user
    ? user.role === "admin"
      ? "/dashboard/admin"
      : user.role === "teacher"
      ? "/dashboard/teacher"
      : "/dashboard/student"
    : "/login";

  return (
    <header className={`w-full z-50 ${language === "bn" ? "font-bengali" : "font-sans"}`}>
      {/* Top Banner (School Logo, Name, Address & 3-Line Menu) */}
      <div className="bg-[#465b6a] py-3 lg:py-4 border-b border-[#3b4c59] relative">
        <div className="container mx-auto px-4 relative flex items-center justify-center">
          {/* Logo & School Info: Logo on left in web/PC view, on top in mobile view */}
          <Link
            href="/"
            className="flex flex-col md:flex-row items-center justify-center text-center md:text-left gap-2.5 md:gap-4.5 group mx-auto min-w-0 px-8 sm:px-12 md:px-0"
          >
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-22 lg:h-22 bg-white rounded-full p-2 shadow-xl shrink-0 border-2 border-white/60 group-hover:scale-105 transition-transform duration-300">
              <Image src="/images/logo/logo.png" alt="BAHS Logo" fill className="object-contain p-1" priority />
            </div>
            <div className="text-white text-center md:text-left min-w-0">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-black leading-tight tracking-wide drop-shadow-md group-hover:text-emerald-300 transition-colors uppercase">
                {t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়", "Baniyachong Adarsha High School")}
              </h1>
              <p className="text-xs sm:text-sm lg:text-[15px] text-gray-100 font-semibold mt-1 flex flex-wrap items-center justify-center md:justify-start gap-x-2.5">
                <span>{t("উপজেলাঃ বানিয়াচং, জেলাঃ হবিগঞ্জ।", "Upazila: Baniyachong, District: Habiganj.")}</span>
                <span className="text-emerald-300 hidden sm:inline">•</span>
                <span className="text-yellow-300 font-bold">{t("স্থাপিত: ১৯৮৫", "Est: 1985")}</span>
                <span className="text-emerald-300 hidden sm:inline">•</span>
                <span className="text-gray-200 font-sans">EIIN: 129344</span>
              </p>
            </div>
          </Link>

          {/* Right: 3-Line Menu Option Button (Absolute to avoid displacing center content) */}
          <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex items-center">
            <button
              onClick={() => setSideMenuOpen(true)}
              className="glossy-btn flex items-center justify-center bg-white/15 hover:bg-white/25 text-white w-10 h-10 rounded-xl border border-white/30 shadow-md group cursor-pointer"
              title="Menu & Profiles"
            >
              <FaBars size={18} className="group-hover:scale-110 transition-transform text-yellow-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Sub-Bar: Real-Time Clock & Date on Left, Login on Right */}
      <div className="lg:hidden bg-[#364652] py-2 px-3 sm:px-4 border-b border-[#2c3e50] flex items-center justify-between gap-2 shadow-inner">
        {/* Left: Full Real-time Clock & Date with Complete Month Name */}
        <div className="flex-1 flex items-center justify-start min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-2.5 sm:px-3 py-1.5 rounded-xl text-white shadow-inner">
            <FaClock className="text-yellow-300 text-xs shrink-0" />
            <span className="text-yellow-300 font-bold text-xs sm:text-sm font-mono tracking-wider shrink-0">
              {currentDateTime ? (
                currentDateTime.toLocaleTimeString(language === "bn" ? "bn-BD" : "en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })
              ) : (
                "--:--:--"
              )}
            </span>
            <span className="text-gray-400 text-xs shrink-0">•</span>
            <span className="text-gray-200 text-xs font-medium whitespace-nowrap">
              {currentDateTime ? (
                currentDateTime.toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              ) : (
                ""
              )}
            </span>
          </div>
        </div>

        {/* Right: Login / Dashboard Button */}
        <div className="shrink-0">
          {user ? (
            <Link
              href={dashboardHref}
              className="glossy-btn flex items-center gap-1.5 bg-[#06874A] hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-400/40 shadow-xs"
            >
              <FaTachometerAlt size={12} />
              <span>{t("ড্যাশবোর্ড", "Dashboard")}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="glossy-btn flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-medium px-3 py-1.5 rounded-xl border border-white/25 shadow-xs"
            >
              <FaUser size={11} />
              <span>{t("লগইন", "Login")}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Desktop Horizontal Navigation Bar */}
      <nav className={`hidden lg:block bg-[#364652] transition-all duration-300 ${scrolled ? "fixed top-0 left-0 w-full shadow-lg z-50" : ""}`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Nav items — centered */}
          <ul className="flex items-center flex-1 justify-center">
            {navItems.map((item) => (
              <li
                key={item.label}
                className="relative group"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="px-4 py-3.5 text-gray-100 hover:bg-[#2c3e50] hover:text-white transition-colors duration-200 flex items-center gap-1 text-[15px]"
                >
                  {item.label}
                  {item.children && <FaChevronDown size={10} className="mt-0.5 opacity-70" />}
                </Link>

                {item.children && openDropdown === item.label && (
                  <div className="absolute top-full left-0 bg-[#2c3e50] shadow-xl min-w-[220px] rounded-b-md overflow-hidden z-50 border-t-2 border-[#06874A]">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-5 py-3 text-sm text-gray-200 hover:bg-[#1a252f] hover:text-white transition-colors border-b border-gray-600/30 last:border-0"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}

            {/* Auth Buttons inside Desktop Nav */}
            <li className="ml-6 border-l border-gray-500/50 pl-6 flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href={dashboardHref}
                    className="glossy-btn flex items-center gap-2 bg-[#06874A] hover:bg-green-600 text-white text-xs px-3.5 py-1.5 rounded-lg border border-emerald-400/40 shadow font-bold"
                  >
                    <FaTachometerAlt size={12} />
                    <span>{t("ড্যাশবোর্ড", "Dashboard")}</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="glossy-btn flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg border border-white/25 shadow font-medium"
                  >
                    <FaUser size={12} />
                    <span>{t("লগইন", "Login")}</span>
                  </Link>
                  <Link
                    href="/register"
                    className="glossy-btn flex items-center gap-1.5 bg-[#06874A] hover:bg-green-600 text-white text-xs px-3.5 py-1.5 rounded-lg border border-emerald-400/40 shadow font-bold"
                  >
                    <FaUserPlus size={12} />
                    <span>{t("রেজিস্টার", "Register")}</span>
                  </Link>
                </div>
              )}
            </li>
          </ul>

          {/* Desktop Live Date & Time — right side of nav bar in glassy box */}
          <div className="flex items-center justify-end py-1.5 min-w-[185px] select-none shrink-0">
            {currentDateTime ? (
              <div className="flex flex-col items-center px-3.5 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm shadow-inner">
                <span className="text-yellow-300 font-bold text-[15px] font-mono tracking-widest leading-none">
                  {currentDateTime.toLocaleTimeString(language === "bn" ? "bn-BD" : "en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })}
                </span>
                <span className="text-gray-200 text-[11px] font-medium mt-1 tracking-wide">
                  {currentDateTime.toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center px-3.5 py-2 rounded-xl border border-white/10 bg-white/5">
                <span className="text-gray-500 text-xs font-mono">--:--:--</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Modern Slide-in Drawer from 3-Line Menu Button */}
      {sideMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setSideMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-sm bg-[#051939] text-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto border-l border-white/10 p-5 sm:p-6 animate-in slide-in-from-right duration-300">
            <div>
              {/* Top Row: Title & Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-white p-1 shrink-0">
                    <img src="/images/logo/logo.png" alt="BAHS" className="w-full h-full object-contain" />
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-xs sm:text-sm leading-tight text-white truncate">
                      {t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়", "BAHS Web Portal")}
                    </h3>
                    <p className="text-[10px] text-gray-300">EIIN: 129344</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <LanguageToggle size="sm" />
                  <button
                    onClick={() => setSideMenuOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition"
                    title="Close Menu"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>

              {/* Real-time Clock Card inside Drawer */}
              {currentDateTime && (
                <div className="mt-4 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaClock className="text-yellow-300 text-sm" />
                    <span className="text-xs font-mono font-bold text-yellow-300">
                      {currentDateTime.toLocaleTimeString(language === "bn" ? "bn-BD" : "en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-300">
                    <FaCalendarAlt size={10} className="text-emerald-400" />
                    <span>
                      {currentDateTime.toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              )}

              {/* Profile / Account Card Section */}
              <div className="my-4 p-4 rounded-2xl bg-white/10 border border-white/15">
                {user ? (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">{user.name}</p>
                        <span className="text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={dashboardHref}
                        onClick={() => setSideMenuOpen(false)}
                        className="flex-1 bg-[#06874A] text-white text-center py-2 rounded-xl text-xs font-bold hover:bg-green-600 transition"
                      >
                        {t("ড্যাশবোর্ড", "Dashboard")}
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setSideMenuOpen(false);
                        }}
                        className="bg-red-600 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition"
                      >
                        {t("লগআউট", "Logout")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-300 mb-3 text-center">
                      {t("অ্যাকাউন্টে প্রবেশ করতে লগইন করুন", "Sign in to access your portal")}
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href="/login"
                        onClick={() => setSideMenuOpen(false)}
                        className="flex-1 bg-white/15 border border-white/20 text-white text-center py-2 rounded-xl text-xs font-bold hover:bg-white/25 transition"
                      >
                        {t("লগইন", "Login")}
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setSideMenuOpen(false)}
                        className="flex-1 bg-[#06874A] text-white text-center py-2 rounded-xl text-xs font-bold hover:bg-green-600 transition"
                      >
                        {t("রেজিস্টার", "Register")}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Links with Expandable Submenus for Mobile */}
              <div className="space-y-1 mb-6">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">
                  {t("ন্যাভিগেশন মেনু", "Navigation Menu")}
                </p>
                {navItems.map((item) => (
                  <div key={item.label} className="border-b border-white/5 last:border-0">
                    {item.children ? (
                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            setMobileOpenDropdown(
                              mobileOpenDropdown === item.label ? null : item.label
                            )
                          }
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-gray-200 hover:bg-white/10 hover:text-white transition"
                        >
                          <span className="font-medium">{item.label}</span>
                          {mobileOpenDropdown === item.label ? (
                            <FaChevronUp size={11} className="text-yellow-300" />
                          ) : (
                            <FaChevronDown size={11} className="text-gray-400" />
                          )}
                        </button>
                        {mobileOpenDropdown === item.label && (
                          <div className="pl-4 pr-2 py-1 space-y-1 bg-white/5 rounded-xl my-1 border-l-2 border-[#06874A]">
                            {item.children.map((child) => (
                              <Link
                                key={child.label}
                                href={child.href}
                                onClick={() => setSideMenuOpen(false)}
                                className="block px-3 py-2 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-white/10 transition"
                              >
                                • {child.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setSideMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-gray-200 hover:bg-white/10 hover:text-white transition"
                      >
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-gray-500">›</span>
                      </Link>
                    )}
                  </div>
                ))}

                {/* Developer Option */}
                <Link
                  href="/developer"
                  onClick={() => setSideMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-gray-200 hover:bg-white/10 hover:text-white transition group border border-emerald-500/20 bg-emerald-950/20 mt-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                      <FaCode />
                    </span>
                    <div>
                      <span className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {t("ডেভেলপার", "Developer")}
                      </span>
                      <span className="text-[11px] text-gray-300 block font-normal">
                        {language === "en" ? dev.name : dev.nameBn}
                      </span>
                      <span className="text-[10px] text-yellow-300/90 block font-medium">
                        {language === "en" ? dev.school : dev.schoolBn}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 group-hover:translate-x-1 transition-transform">›</span>
                </Link>
              </div>
            </div>

            {/* Bottom: Portal info */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span>© ২০২৬ {t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়", "BAHS Portal")}</span>
              <span className="text-[11px] text-gray-500">EIIN: 129344</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
