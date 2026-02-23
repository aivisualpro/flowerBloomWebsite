import React from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function AboutBanner() {
  const BG =
    "/images/about/banner.avif"; // background
  const thumbs = [
    "/images/about/side-banner (1).avif",
    "/images/about/side-banner (2).avif",
    "/images/about/side-banner (3).avif",
  ];

  const KPIs = [
    { value: "300k+", en_label: "Customers Served", ar_label: "خدم العملاء" },
    { value: "300k+", en_label: "Order Delivered", ar_label: "تم تسليم الطلب" },
    { value: "38", en_label: "City Covered", ar_label: "المدينة المغطاة" },
  ];

  const { i18n } = useTranslation();
  const langClass = i18n.language === "ar";

  return (
    <section className="w-full py-4 px-4">
      <div className="relative custom-container rounded-[28px] overflow-hidden">
        {/* Background image */}
        <img
          src={BG}
          alt="Background"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Soft vignette & color tint to match reference theme */}
        <div className="absolute inset-0 bg-black opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/30 to-black/30" />

        {/* Content grid */}
        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6 py-5 sm:p-8 lg:p-10 min-h-[520px]">
          {/* Left content */}
          <div className="flex flex-col justify-between">
            <div className="mb-4 flex items-center gap-3">
              <Link href="/" className="text-primary hover:bg-primary/10 transition-all duration-300 border-primary/30 border-[1px] p-2 rounded-full">
                 {langClass ? <IoIosArrowForward size={20} /> : <IoIosArrowBack size={20} />}
              </Link>
              <h2 className="text-2xl sm:text-3xl text-primary">
                {langClass ? "معلومات عنا" : "About us"}
              </h2>
            </div>

            <div>
              {/* Glassy blurb card */}
              <div className="max-w-2xl rounded-2xl border border-primary bg-primary/15 p-5 sm:p-6">
                <p className="text-white font-semibold leading-relaxed">
                  {langClass ? "في فلاور بلوم، نؤمن بأن الهدية أكثر من مجرد لفتة، بل هي فرصة لترك انطباع دائم." : "At Flower Bloom, we believe gifting is more than a gesture—it's a chance to make a lasting impression."}
                </p>
                <p className="mt-4 text-white text-sm leading-6">
                  {langClass ? "منذ عام ٢٠١٧، تُمكّن فلاورد العلامات التجارية في جميع أنحاء منطقة الشرق الأوسط وشمال إفريقيا من تنسيق الزهور وهدايا الشركات عالية الجودة. نجمع بين التوريد العالمي والحرفية الدقيقة لمساعدتك على الارتقاء بكل لحظة عمل، بدءًا من تقدير العملاء ووصولًا إلى تكريم الموظفين، وما إلى ذلك." : "Since 2017, Floward has empowered brands across the MENAregion with high‑quality floral arrangements and corporategifts. We combine global sourcing with meticulouscraftsmanship to help you elevate every business moment—fromclient appreciation to employee recognition and beyond."}
                </p>
              </div>

              {/* KPI cards */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
                {KPIs.map((kpi, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-primary bg-primary/15 px-6 py-5 text-white"
                  >
                    <h3 className="text-2xl text-white">
                      {kpi.value}
                    </h3>
                    <div className="mt-1 text-sm text-white">
                      {langClass ? kpi.ar_label : kpi.en_label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right stacked images */}
          <div className="hidden lg:flex flex-col items-end justify-center gap-5 pr-1">
            {thumbs.map((src, i) => (
              <div
                key={i}
                className="relative h-[140px] w-[125px] rounded-2xl overflow-hidden border-[2px] border-primary ring-1 ring-black/10"
              >
                <img
                  src={src}
                  alt={`side ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                {/* cyan glow edge */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-cyan-300/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
