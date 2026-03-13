import React from "react";
import { useTranslation } from "react-i18next";

export default function HowToPlaceOrder() {

  const { i18n } = useTranslation();
  const langClass = i18n.language === "ar";

  const steps = [
    {
      en_title: "Contact us",
      ar_title: "اتصل بنا",
      en_subtitle: "Share your requirements",
      ar_subtitle: "شارك متطلباتك",
      img: "/images/about/how-to-order (3).jpg",
    },
    {
      en_title: "Get Proposals",
      ar_title: "احصل على العروض",
      en_subtitle: "Receive tailored options.",
      ar_subtitle: "استلم خيارات مُخصصة.",
      img: "/images/about/how-to-order (2).jpg",
    },
    {
      en_title: "Confirm and Go",
      ar_title: "أكِّد وانطلق",
      en_subtitle: "We'll take care of the rest!",
      ar_subtitle: "سنعتني بالباقي!",
      img: "/images/about/how-to-order (1).jpg",
    },
  ];  

  return (
    <section className="w-full py-12 bg-white">
      <div className="custom-container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl text-primary mb-10">
          {langClass ? "كيفية تقديم الطلب" : "How To Place An Order"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative rounded-2xl overflow-hidden group shadow-lg"
            >
              <img
                src={step.img}
                alt={langClass ? step.ar_title : step.en_title}
                className="h-96 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-6 text-left">
                <h5 className="text-primary text-2xl text-center font-bold">
                  {langClass ? step.ar_title : step.en_title}
                </h5>
                <p className="text-white text-base text-center">{langClass ? step.ar_subtitle : step.en_subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
