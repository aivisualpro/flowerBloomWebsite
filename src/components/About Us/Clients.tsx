import React from "react";
import { useTranslation } from "react-i18next";

export default function Clients() {
  const { i18n } = useTranslation();
  const langClass = i18n.language === "ar";

  const stats = [
    { value: "500K+", label: langClass ? "عملاء سعداء" : "Happy Clients" },
    { value: "6M+", label: langClass ? "عملاء سعداء" : "Happy Customers" },
  ];

  const logos = [
    { name: "Qatar Airways", src: "/images/client/1 (2).jpg" },
    { name: "QNB", src: "/images/client/1 (1).jpg" },
    { name: "Qatar", src: "/images/client/1 (1).png" },
    { name: "Award", src: "/images/client/1 (2).png" },
    { name: "Award", src: "/images/client/1 (3).png" },
  ];

  return (
    <section className="w-full pt-8 pb-10">
      <div className="custom-container">
        <div className="rounded-[22px] border border-primary/60 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-4 sm:p-6 md:p-8">
          <div className="md:flex items-center justify-between gap-4">
            {/* Left column */}
            <div className="lg:w-[50%]">
              <h3 className="text-2xl sm:text-3xl text-primary mb-6">
                {langClass ? "عملاؤنا" : "OUR CLIENTS"}
              </h3>

              <div className="flex gap-5 md:mb-0 mb-4">
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="w-1/2 lg:w-[170px] xl:w-[200px] rounded-2xl bg-primary px-3 md:px-6 py-5 text-white md:shadow-[0_8px_18px_rgba(13,148,136,0.25)]"
                  >
                    <h3 className="text-2xl text-white">{s.value}</h3>
                    <span className="mt-1 text-white text-xs font-medium">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className="lg:w-[50%]">
              <p className="text-justify lg:text-xs xl:text-[13.5px] leading-6 text-black">
                {langClass
                  ? "في فلاور بلوم، عملاؤنا هم محور كل ما نقوم به. من الشركات العالمية إلى الشركات الرائدة إقليميًا، تعاونّا مع علامات تجارية تُقدّر الجودة والإبداع والتواصل الهادف. يعكس كل تعاون التزامنا المشترك بالتميز في مجال هدايا الشركات وتجارب الزهور في منطقة الشرق الأوسط وشمال أفريقيا."
                  : " At Flower Bloom, our clients are at the heart of everything we do. From global enterprises to regional leaders, we've partnered with brands that value quality, creativity, and meaningful connections. Every collaboration reflects our shared commitment to excellence in corporate gifting and floral experiences across the MENA region."}
              </p>

              <div className="mt-6 grid lg:grid-cols-5 items-center gap-3">
                {logos.map((logo, idx) => (
                  <div
                    key={idx}
                    className="group relative flex h-[64px] items-center justify-center rounded-2xl border border-primary bg-white transition hover:-translate-y-0.5"
                    style={{
                      background:
                        "linear-gradient(90deg, #11e7ff1f 0%, #e59eff1f 50%, #f6b4001f 100%)",
                    }}
                  >
                    <img
                      src={logo.src}
                      alt={logo.name}
                      className="max-h-10 lg:max-w-[50px] xl:max-w-[70px] 2xl:max-w-[92px] object-contain opacity-90 group-hover:opacity-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
