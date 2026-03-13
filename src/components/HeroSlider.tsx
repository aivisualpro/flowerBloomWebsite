import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "./Button";
import { useTranslation } from "react-i18next";
import { flushSync } from "react-dom";

export default function CenterModeCarousel({
  autoplay = true,
  interval = 5000,
  pauseOnHover = false,
}) {
  const items = [
    {
      id: "bannerOne",
      src: "/images/Hero Slider/banner-one.jpg",
      en_title: "Gift That Speaks From The Heart",
      ar_title: "هدية تتحدث من القلب",
      en_description:
        "Express your emotions with the perfect gift that conveys your deepest thoughts. Thoughtful, elegant, and full of love.",
      ar_description:
        "عبّر عن مشاعرك بالهدية المثالية التي تنقل أعمق أفكارك. مدروسة، أنيقة ومليئة بالحب.",
      en_buttonLabel: "Explore Collection",
      ar_buttonLabel: "اكتشف المجموعة",
    },
    {
      id: "bannerTwo",
      src: "/images/Hero Slider/banner-two.jpg",
      en_title: "Say It With Flowers",
      ar_title: "عبّر بالزهور",
      en_description:
        "Flowers have a language of their own. Send a beautiful bouquet that says more than words can express.",
      ar_description:
        "للزهور لغة خاصة بها. أرسل باقة جميلة تعبّر أكثر مما تستطيع الكلمات قوله.",
      en_buttonLabel: "Explore Collection",
      ar_buttonLabel: "اكتشف المجموعة",
    },
    {
      id: "bannerThree",
      src: "/images/Hero Slider/banner-three.avif",
      en_title: "Celebrate Love",
      ar_title: "احتفل بالحب",
      en_description:
        "Whether it is love, admiration, or gratitude, flowers are the best way to express how much someone means to you.",
      ar_description:
        "سواء كان حبًا، إعجابًا أو امتنانًا، الزهور هي أفضل وسيلة للتعبير عن مدى أهمية شخص ما بالنسبة لك.",
      en_buttonLabel: "Explore Collection",
      ar_buttonLabel: "اكتشف المجموعة",
    },
    {
      id: "bannerFour",
      src: "/images/Hero Slider/banner-four.avif",
      en_title: "Make A Statement",
      ar_title: "كن مميزًا",
      en_description:
        "Make every occasion unforgettable with bold, stunning floral arrangements that leave a lasting impression.",
      ar_description:
        "اجعل كل مناسبة لا تُنسى مع تنسيقات زهور جريئة ومذهلة تترك انطباعًا دائمًا.",
      en_buttonLabel: "Explore Collection",
      ar_buttonLabel: "اكتشف المجموعة",
    },
    {
      id: "bannerFive",
      src: "/images/Hero Slider/banner-five.avif",
      en_title: "The Perfect Gift",
      ar_title: "الهدية المثالية",
      en_description:
        "The perfect gift for any occasion - beautiful flowers that brighten any room and warm any heart.",
      ar_description:
        "الهدية المثالية لأي مناسبة – زهور جميلة تُضيء أي غرفة وتُبهج أي قلب.",
      en_buttonLabel: "Explore Collection",
      ar_buttonLabel: "اكتشف المجموعة",
    },
  ];

  const { i18n } = useTranslation();
  const langClass = i18n.language === "ar" ? "ar" : "en";
  const isRTL = i18n.language === "ar";

  const n = items.length;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);

  // Mobile slider state
  const [mobileIdx, setMobileIdx] = useState(0);
  const [mobileAnimating, setMobileAnimating] = useState(false);
  const mobileTouchRef = useRef<{ startX: number; startY: number } | null>(null);
  const mobileTimerRef = useRef<number | null>(null);

  // single timer
  const timeoutRef = useRef<number | null>(null);
  const clearTimer = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  const step = (delta: number) => {
    flushSync(() => setDir(delta > 0 ? 1 : -1));
    setCurrent((c) => (c + delta + n) % n);
  };

  const goNext = () => {
    clearTimer();
    step(1);
  };

  const goPrev = () => {
    clearTimer();
    step(-1);
  };

  // Desktop autoplay
  useEffect(() => {
    clearTimer();
    if (!autoplay || paused) return;
    timeoutRef.current = window.setTimeout(() => {
      step(1);
    }, interval);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, paused, interval, current, n, isRTL]);

  // Pause when tab hidden
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const hoverHandlers = pauseOnHover
    ? {
        onMouseEnter: () => setPaused(true),
        onMouseLeave: () => setPaused(false),
      }
    : {};

  // Visible window: center +/-2
  const visible = useMemo(() => {
    const order = [-2, -1, 0, 1, 2].map((k) => (current + k + n) % n);
    return order.map((realIdx, j) => {
      const rel = j - 2;
      let cls = "far";
      if (rel === -2) cls = "lt2";
      else if (rel === -1) cls = "lt1";
      else if (rel === 0) cls = "slick-center";
      else if (rel === 1) cls = "gt1";
      else if (rel === 2) cls = "gt2";
      return { slideId: realIdx, cls, ...items[realIdx] };
    });
  }, [current, n, items]);

  // ========== Mobile slider logic ==========
  const mobileGoTo = useCallback((idx: number) => {
    if (mobileAnimating) return;
    setMobileAnimating(true);
    setMobileIdx(idx);
    setTimeout(() => setMobileAnimating(false), 700);
  }, [mobileAnimating]);

  const mobileNext = useCallback(() => {
    mobileGoTo((mobileIdx + 1) % n);
  }, [mobileIdx, n, mobileGoTo]);

  const mobilePrev = useCallback(() => {
    mobileGoTo((mobileIdx - 1 + n) % n);
  }, [mobileIdx, n, mobileGoTo]);

  // Mobile autoplay
  useEffect(() => {
    if (mobileTimerRef.current) clearTimeout(mobileTimerRef.current);
    mobileTimerRef.current = window.setTimeout(() => {
      mobileGoTo((mobileIdx + 1) % n);
    }, 5000);
    return () => {
      if (mobileTimerRef.current) clearTimeout(mobileTimerRef.current);
    };
  }, [mobileIdx, n, mobileGoTo]);

  // Mobile touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    mobileTouchRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
    };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!mobileTouchRef.current) return;
    const dx = e.changedTouches[0].clientX - mobileTouchRef.current.startX;
    const dy = e.changedTouches[0].clientY - mobileTouchRef.current.startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) mobileNext();
      else mobilePrev();
    }
    mobileTouchRef.current = null;
  };

  return (
    <section className="hero_slider py-5">
      {/* ===== Desktop view (unchanged) ===== */}
      <div
        className="cmc-wrap custom-container mx-auto px-4 lg:block hidden"
        data-paused={paused ? "1" : "0"}
        {...hoverHandlers}
      >
        <button className="nav prev" onClick={goPrev} aria-label="Previous">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path
              d="M15 6l-6 6 6 6"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="track" data-dir={dir} data-lang={langClass}>
          {visible.map(
            ({
              slideId,
              src,
              cls,
              en_title,
              ar_title,
              en_description,
              ar_description,
            }) => (
              <div
                className={`z-2 relative slide ${cls} ${langClass}`}
                key={slideId}
              >
                <img
                  src={src}
                  className="absolute top-0 left-0 rounded-[35px] w-full h-full object-cover"
                  alt=""
                />
                <div className="overlay rounded-[35px] absolute top-0 left-0 w-full h-full bg-black/30 z-[0]" />
                <div className="slider-content flex flex-col ms-auto justify-center max-w-sm p-4 z-[2]">
                  <h5 className="text-white font-medium text-[1.7rem]">
                    {langClass === "en" ? en_title : ar_title}
                  </h5>
                  <p
                    className={`${
                      langClass === "ar" ? "text-[18px]" : "text-[14px]"
                    } py-1`}
                  >
                    {langClass === "en" ? en_description : ar_description}
                  </p>
                </div>
              </div>
            )
          )}
        </div>

        <button className="nav next" onClick={goNext} aria-label="Next">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path
              d="M9 6l6 6-6 6"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* ===== PREMIUM Mobile & Tablet Slider ===== */}
      <div className="lg:hidden block custom-container px-4">
        <div
          className="relative w-full overflow-hidden rounded-[28px] sm:rounded-[35px]"
          style={{ height: "clamp(340px, 56vw, 520px)" }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* All slides stacked, crossfade */}
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="absolute inset-0 w-full h-full"
              style={{
                opacity: idx === mobileIdx ? 1 : 0,
                transform: idx === mobileIdx ? "scale(1)" : "scale(1.08)",
                transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.9s cubic-bezier(0.4,0,0.2,1)",
                zIndex: idx === mobileIdx ? 2 : 1,
                pointerEvents: idx === mobileIdx ? "auto" : "none",
              }}
            >
              {/* Image */}
              <img
                src={item.src}
                alt={langClass === "en" ? item.en_title : item.ar_title}
                className="absolute inset-0 w-full h-full object-cover"
                loading={idx === 0 ? "eager" : "lazy"}
              />

              {/* Premium gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.78) 100%)",
                }}
              />

              {/* Subtle teal accent glow */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(135deg, rgba(15,180,187,0.12) 0%, transparent 50%)",
                }}
              />

              {/* Content - positioned at bottom */}
              <div
                className={`absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10 z-10 ${
                  isRTL ? "text-right" : "text-left"
                }`}
                dir={isRTL ? "rtl" : "ltr"}
              >
                {/* Animated title */}
                <h2
                  className="text-white font-bold leading-tight mb-2 sm:mb-3"
                  style={{
                    fontSize: "clamp(1.4rem, 5vw, 2.2rem)",
                    transform: idx === mobileIdx ? "translateY(0)" : "translateY(20px)",
                    opacity: idx === mobileIdx ? 1 : 0,
                    transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1) 0.15s, opacity 0.5s ease 0.15s",
                    textShadow: "0 2px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  {langClass === "en" ? item.en_title : item.ar_title}
                </h2>

                {/* Animated description */}
                <p
                  className="text-white/85 leading-relaxed max-w-md"
                  style={{
                    fontSize: "clamp(0.82rem, 2.5vw, 1rem)",
                    transform: idx === mobileIdx ? "translateY(0)" : "translateY(16px)",
                    opacity: idx === mobileIdx ? 1 : 0,
                    transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1) 0.3s, opacity 0.5s ease 0.3s",
                  }}
                >
                  {langClass === "en" ? item.en_description : item.ar_description}
                </p>
              </div>
            </div>
          ))}

          {/* Custom nav arrows */}
          <button
            onClick={mobilePrev}
            aria-label="Previous slide"
            className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-4 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 active:scale-90"
            style={{
              background: "rgba(15,180,187,0.7)",
              boxShadow: "0 4px 20px rgba(15,180,187,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" className="sm:w-5 sm:h-5">
              <path d="M15 6l-6 6 6 6" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={mobileNext}
            aria-label="Next slide"
            className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-4 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 active:scale-90"
            style={{
              background: "rgba(15,180,187,0.7)",
              boxShadow: "0 4px 20px rgba(15,180,187,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" className="sm:w-5 sm:h-5">
              <path d="M9 6l6 6-6 6" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Premium dot indicators with progress bar */}
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => mobileGoTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="relative h-[6px] rounded-full overflow-hidden transition-all duration-500"
                style={{
                  width: idx === mobileIdx ? 32 : 8,
                  background: idx === mobileIdx
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(255,255,255,0.45)",
                }}
              >
                {idx === mobileIdx && (
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "#0FB4BB",
                      animation: "heroProgressBar 5s linear forwards",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
