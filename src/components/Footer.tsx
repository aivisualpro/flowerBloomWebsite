"use client";
import React, { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { FiChevronDown } from "react-icons/fi";
import { PiGlobeHemisphereWestLight } from "react-icons/pi";
import { useTranslation } from "react-i18next";
import { FaLinkedinIn, FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";

const countries = ["Qatar"];

const Footer = () => {
  const { t, i18n } = useTranslation("translation"); // make sure namespace is "common"
  const [selected, setSelected] = useState("Qatar");
  const isArabic = i18n.language === "ar";

  // keep document direction in sync with language
  useEffect(() => {
    const dir = t("dir") as string;
    document.documentElement.dir = dir;
  }, [i18n.language, t]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // dir is handled by effect above
  };

  // ----- i18n sections -----
  const explore = (t("footer.explore", { returnObjects: true }) || { title: "", links: [] }) as any;

  const knowUs = (t("footer.knowUs", { returnObjects: true }) || { title: "", links: [] }) as any;

  const customerService = (t("footer.customerService", { returnObjects: true }) || { title: "", links: [] }) as any;

  const copyright = t("footer.copyright");

  return (
    <footer className="bg-black text-white py-10">
      <div className="custom-container">
        <div className="lg:flex justify-between gap-8">
          {/* Brand + controls */}
          <div className="lg:w-[35%] flex lg:flex-col justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/images/flower-bloom-logo.png"
                alt="Flower Bloom"
                className="h-12 md:h-14 w-auto object-contain"
              />
              <h1 className={`text-primary ${isArabic ? "lg:text-4xl xl:text-5xl 2xl:text-6xl" : "lg:text-[1.5rem] xl:text-4xl 2xl:text-4xl"}`}>
                {t("logo")}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => changeLanguage(isArabic ? "en" : "ar")}
                className="flex items-center bg-[#0fb5bb50] gap-2 rounded-[10px] px-8 py-2 text-[15px] text-white font-medium shadow-sm"
              >
                <span>{isArabic ? "English" : "العربية"}</span>
                <PiGlobeHemisphereWestLight className="text-[18px]" style={{ color: "#0FB4BB" }} />
              </button>
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:w-[65%] lg:mt-0 mt-12">
            <div className="grid md:grid-cols-3 gap-10">
              {/* Explore */}
              <div>
                <h5 className="text-lg xl:text-lg font-semibold text-primary mb-4">{explore.title}</h5>
                <ul>
                  {explore.links?.map((l: any) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-white lg:text-lg 2xl:text-xl inline-block mb-3 hover:text-primary">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Know us */}
              <div>
                <h5 className="text-lg xl:text-lg font-semibold text-primary mb-4">{knowUs.title}</h5>
                <ul>
                  {knowUs.links?.map((l: any) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-white xl:text-lg inline-block mb-3 hover:text-primary">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Customer service */}
              <div>
                <h5 className="text-lg lg:text-lg 2xl:text-xl font-semibold text-primary mb-4">{customerService.title}</h5>
                <ul>
                  {customerService.links?.map((l: any) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-white lg:text-lg 2xl:text-xl inline-block mb-3 hover:text-primary">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Stores + payments */}
        <div className="sm:flex items-center justify-between mt-10">
          <div className="flex items-center justify-between gap-4 sm:mb- mb-4">
            <img src="/images/play.webp" className="w-[90px] sm:w-[120px] rounded-[10px]" alt="Google Play" />
            <img src="/images/gallary.png" className="w-[90px] sm:w-[120px] rounded-[10px]" alt="AppGallery" />
            <img src="/images/store.png" className="w-[90px] sm:w-[120px] rounded-[10px]" alt="App Store" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <img src="/images/gateway/3.webp" className="w-[60px] h-[40px] object-contain rounded-[5px] bg-white" alt="PayPal" />
            <img src="/images/gateway/1.png" className="w-[60px] h-[40px] object-contain rounded-[5px] bg-white" alt="Apple Pay" />
            <img src="/images/gateway/2.webp" className="w-[60px] h-[40px] object-contain rounded-[5px] bg-white" alt="Visa" />
            <img src="/images/gateway/4.png" className="w-[60px] h-[40px] object-contain rounded-[5px] bg-white" alt="Mastercard" />
          </div>
        </div>

        <hr className="border-white/20 mt-8" />

        {/* Copyright + socials */}
        <div className="mt-8 flex md:flex-row flex-col md:gap-0 gap-4 items-center justify-center md:justify-between">
          <p className="text-white md:text-start text-center font-medium">{copyright}</p>
          <div className="flex items-center gap-4">
            <Link href="#"><FaLinkedinIn className="hover:text-primary transition-all duration-200 text-[24px]" /></Link>
            <Link href="#"><FaFacebookF className="hover:text-primary transition-all duration-200 text-[24px]" /></Link>
            <Link href="#"><FaInstagram className="hover:text-primary transition-all duration-200 text-[24px]" /></Link>
            <Link href="#"><FaYoutube className="hover:text-primary transition-all duration-200 text-[24px]" /></Link>
            <Link href="#"><FaXTwitter className="hover:text-primary transition-all duration-200 text-[24px]" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
