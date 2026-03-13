// @ts-nocheck
// FilterGifts.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RxCross1 } from "react-icons/rx";
import { IoFilter } from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from "../ProductCard";

import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";

/* ==================== CONFIG ==================== */
import { BASE_URL as API_BASE } from "@/api/config";
const PAGE_SIZE = 15;

/* ==================== HELPERS ==================== */
const uniq = (arr) => Array.from(new Set((arr || []).filter(Boolean)));
const toSlug = (s) => (s || "").toString().trim().toLowerCase();

const qstr = (obj) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && `${v}`.trim() !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

async function getFilterProducts(params, signal) {
  const qs = qstr(params);
  const res = await fetch(`${API_BASE}/product/lists/filters?${qs}`, { signal }); // <-- keep full QS
  if (!res.ok) throw new Error(`Failed ${res.status}`);
  const json = await res.json();
  const items = json?.data?.docs ?? [];
  const total = json?.data?.totalDocs ?? 0;
  const totalPages =
    json?.data?.totalPages ??
    Math.max(1, Math.ceil(total / (params.limit || PAGE_SIZE)));
  const page = json?.data?.page ?? params.page ?? 1;
  return { items, total, totalPages, page };
}

/* Map :type segment -> backend query key */
function normalizeType(type) {
  switch (String(type || "").toLowerCase()) {
    case "q":
    case "search":
      return "q";
    case "occasion":
    case "occasions":
      return "occasion";
    case "subcategory":
      return "subCategory";
    case "brand":
    case "brands":
      return "brand";
    case "recipient":
    case "recipients":
      return "recipient";
    default:
      return "";
  }
}

/* ==================== COMPONENT ==================== */
export default function FilterableFlowerGrid() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const navigate = useRouter();
  const { type, name } = useParams(); // /filters/:type/:name
  const [sp] = useSearchParams(); // optional fallback

  /* ----- BASE from pathname (priority) then query fallback ----- */
  const tKey = normalizeType(type);
  const baseFromPath = {
    q: tKey === "q" ? name || "" : "",
    occasion: tKey === "occasion" ? name || "" : "",
    subCategory: tKey === "subCategory" ? name || "" : "",
    brand: tKey === "brand" ? name || "" : "",
    recipient: tKey === "recipient" ? name || "" : "",
  };
  const baseFromQuery = {
    q: sp.get("q") || "",
    occasion: sp.get("occasion") || "",
    subCategory: sp.get("subCategory") || "",
    brand: sp.get("brand") || "",
    recipient: sp.get("recipient") || "",
  };

  // For *search results only*, we'll use q and still keep others if you combine them.
  const baseFilter = {
    q: baseFromPath.q || baseFromQuery.q,
    occasion: baseFromPath.occasion || baseFromQuery.occasion,
    subCategory: baseFromPath.subCategory || baseFromQuery.subCategory,
    brand: baseFromPath.brand || baseFromQuery.brand,
    recipient: baseFromPath.recipient || baseFromQuery.recipient,
  };

  // server pagination
  const [page, setPage] = useState(1);

  // ===== Open/Close sidebar
  const [open, setOpen] = useState(false);

  // ===== Client-side filters
  const [categorySet, setCategorySet] = useState(new Set());
  const [recipientsSet, setRecipientsSet] = useState(new Set());
  const [brandsSet, setBrandsSet] = useState(new Set());
  const [colorsSet, setColorsSet] = useState(new Set());
  const [occasionsSet, setOccasionsSet] = useState(new Set());
  const [priceSort, setPriceSort] = useState("");

  const clearClientFilters = () => {
    setCategorySet(new Set());
    setRecipientsSet(new Set());
    setBrandsSet(new Set());
    setColorsSet(new Set());
    setOccasionsSet(new Set());
    setPriceSort("");
  };

  const toggleSet = (setObj, value) => {
    const next = new Set(setObj);
    next.has(value) ? next.delete(value) : next.add(value);
    return next;
  };

  // ===== Server fetch (base dataset + pagination)
  const [serverPage, setServerPage] = useState({
    items: [],
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setShowLoader(true);

        const payload = await getFilterProducts(
          {
            q: baseFilter.q, // <-- search term
            // (keep others if you want combined search with filters)
            occasion: baseFilter.occasion,
            subCategory: baseFilter.subCategory,
            brand: baseFilter.brand,
            recipient: baseFilter.recipient,
            page,
            limit: PAGE_SIZE,
          },
          controller.signal
        );

        setServerPage({
          items: payload.items,
          total: payload.total,
          totalPages: payload.totalPages,
        });

        requestAnimationFrame(() => {
          requestAnimationFrame(() => setShowLoader(false));
        });
      } catch (e) {
        if (e.name !== "AbortError") {
          setShowLoader(false);
          setErr(e.message);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    baseFilter.q,
    baseFilter.subCategory,
    baseFilter.occasion,
    baseFilter.brand,
    baseFilter.recipient,
    page,
  ]);

  // Reset page + local filters whenever search term or route changes
  useEffect(() => {
    setPage(1);
    clearClientFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, name]);

  const pageItems = serverPage.items;

  /* ===== Derive filter options FROM CURRENT PAGE ONLY ===== */
  const categoryOptions = useMemo(() => {
    const slugs = uniq(
      pageItems.flatMap((p) =>
        Array.isArray(p.categories)
          ? p.categories.map((c) => toSlug(c?.slug || c?.name))
          : []
      )
    );
    return slugs.map((slug) => {
      const sample = pageItems.find((p) =>
        p.categories?.some((c) => toSlug(c?.slug || c?.name) === slug)
      );
      const found = sample?.categories?.find(
        (c) => toSlug(c?.slug || c?.name) === slug
      );
      return {
        slug,
        en_name: found?.name || slug,
        ar_name: found?.ar_name || "",
      };
    });
  }, [pageItems]);

  const recipientOptions = useMemo(() => {
    const slugs = uniq(
      pageItems.flatMap(
        (p) => p.recipients?.map((r) => toSlug(r?.slug || r?.name)) || []
      )
    );
    return slugs.map((slug) => {
      const sample = pageItems.find((p) =>
        p.recipients?.some((r) => toSlug(r?.slug || r?.name) === slug)
      );
      const found = sample?.recipients?.find(
        (r) => toSlug(r?.slug || r?.name) === slug
      );
      return {
        slug,
        en_name: found?.name || slug,
        ar_name: found?.ar_name || "",
      };
    });
  }, [pageItems]);

  const brandOptions = useMemo(() => {
    const slugs = uniq(
      pageItems
        .map((p) => toSlug(p?.brand?.slug || p?.brand?.name))
        .filter(Boolean)
    );
    return slugs.map((slug) => {
      const sample = pageItems.find(
        (p) => toSlug(p?.brand?.slug || p?.brand?.name) === slug
      );
      return {
        slug,
        en_name: sample?.brand?.name || slug,
        ar_name: sample?.brand?.ar_name || "",
      };
    });
  }, [pageItems]);

  const colorOptions = useMemo(() => {
    const labels = uniq(
      pageItems.flatMap((p) =>
        (p.colors || []).map((c) =>
          typeof c === "string"
            ? c
            : c?.name || c?.slug || c?.ar_name || c?._id || ""
        )
      )
    );
    return labels.map((label) => ({
      slug: toSlug(label),
      en_name: label,
      ar_name: label,
    }));
  }, [pageItems]);

  const occasionOptions = useMemo(() => {
    const slugs = uniq(
      pageItems.flatMap(
        (p) => p.occasions?.map((o) => toSlug(o?.slug || o?.name)) || []
      )
    );
    return slugs.map((slug) => {
      const sample = pageItems.find((p) =>
        p.occasions?.some((o) => toSlug(o?.slug || o?.name) === slug)
      );
      const found = sample?.occasions?.find(
        (o) => toSlug(o?.slug || o?.name) === slug
      );
      return {
        slug,
        en_name: found?.name || slug,
        ar_name: found?.ar_name || "",
      };
    });
  }, [pageItems]);

  /* ===== Apply CLIENT-SIDE filters & sort (CURRENT PAGE ONLY) ===== */
  const filtered = useMemo(() => {
    let list = [...pageItems];

    if (categorySet.size) {
      list = list.filter((p) =>
        p.categories?.some((c) => categorySet.has(toSlug(c?.slug || c?.name)))
      );
    }
    if (recipientsSet.size) {
      list = list.filter((p) =>
        p.recipients?.some((r) => recipientsSet.has(toSlug(r?.slug || r?.name)))
      );
    }
    if (brandsSet.size) {
      list = list.filter((p) =>
        brandsSet.has(toSlug(p?.brand?.slug || p?.brand?.name))
      );
    }
    if (colorsSet.size) {
      list = list.filter((p) =>
        (p.colors || []).some((c) => {
          const label =
            typeof c === "string"
              ? c
              : c?.name || c?.slug || c?.ar_name || c?._id || "";
          return colorsSet.has(toSlug(label));
        })
      );
    }
    if (occasionsSet.size) {
      list = list.filter((p) =>
        p.occasions?.some((o) => occasionsSet.has(toSlug(o?.slug || o?.name)))
      );
    }

    if (priceSort === "hl")
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (priceSort === "lh")
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));

    return list;
  }, [
    pageItems,
    categorySet,
    recipientsSet,
    brandsSet,
    colorsSet,
    occasionsSet,
    priceSort,
  ]);

  return (
    <section id="filter_gifts" className="pb-10 relative">
      {/* GLOBAL OVERLAY LOADER */}
      {showLoader && (
        <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-[1px] flex items-center justify-center">
          <ClipLoader size={44} color={"#0FB4BB"} />
        </div>
      )}

      <div
        className={`custom-container transition-opacity duration-150 ${
          showLoader ? "opacity-0 pointer-events-none select-none" : "opacity-100"
        }`}
        aria-busy={showLoader}
      >
        {/* Header Row */}
        <div className="pt-10 pb-2 flex md:flex-row flex-col items-center justify-between relative">
          <div className="md:w-[50%] lg:w-[60%]">
            <h1 className="text-[1.3rem] md:text-[1.5rem] xl:text-[2rem] 2xl:text-[2.5rem] text-primary">
              {baseFilter.q
                ? (isAr ? "نتائج البحث عن: " : "Search results for: ") + baseFilter.q
                : isAr ? "زهور خارجة عن المألوف" : "Flowers Beyond Ordinary"}
            </h1>
          </div>

          {/* You can keep or hide the occasion chips on the search page; keeping them here */}
          <div className="w-full md:w-[50%] lg:w-[60%] mt-4 relative">
            <Swiper
              modules={[Navigation, A11y]}
              dir={isAr ? "rtl" : "ltr"}
              direction="horizontal"
              slidesPerGroup={1}
              breakpoints={{
                0: { slidesPerView: 1 },
                768: { slidesPerView: 1.5 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 3.5 },
              }}
              spaceBetween={20}
              speed={500}
              centeredSlides={false}
              grabCursor
              watchOverflow
              loop={occasionOptions.length > 4}
              navigation={{ prevEl: ".oc-prev", nextEl: ".oc-next" }}
              onSwiper={(swiper) => {
                setTimeout(() => {
                  try {
                    swiper.params.navigation.prevEl = document.querySelector(".oc-prev");
                    swiper.params.navigation.nextEl = document.querySelector(".oc-next");
                    swiper.navigation.init();
                    swiper.navigation.update();
                  } catch {}
                }, 0);
              }}
              className="mySwiper overflow-hidden"
            >
              {occasionOptions.map((o) => (
                <SwiperSlide key={o.slug}>
                  <button
                    onClick={() => navigate(`/filters/occasions/${o.slug}`)}
                    className={`group border-primary/30 ${
                      isAr ? "lg:text-sm 2xl:text-[1rem]" : "lg:text-xs 2xl:text-[.8rem]"
                    } flex items-center justify-between gap-2 rounded-[8px] font-medium border px-4 py-3 transition text-black w-full`}
                    title={isAr ? o.ar_name : o.en_name}
                  >
                    <span>{isAr ? o.ar_name : o.en_name}</span>
                    {isAr ? <IoIosArrowBack size={16} color="#0FB4BB" /> : <IoIosArrowForward size={16} color="#0FB4BB" />}
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom nav buttons */}
            <div className={`absolute -bottom-12 ${isAr ? "left-0" : "left-full -translate-x-full"} flex items-center gap-3`}>
              <button className="oc-prev grid place-items-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary hover:bg-primary/70 text-white shadow" aria-label="Previous">
                {isAr ? <FiChevronRight size={22} /> : <FiChevronLeft size={22} />}
              </button>
              <button className="oc-next grid place-items-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary hover:bg-primary/70 text-white shadow" aria-label="Next">
                {isAr ? <FiChevronLeft size={22} /> : <FiChevronRight size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Select Filters button */}
        <div className="select-filter-btn mb-10 mt-4">
          <button
            onClick={() => setOpen((s) => !s)}
            className={`${open ? "bg-primary text-white" : "bg-transparent text-primary"} transition-all duration-300 inline-flex items-center gap-2 rounded-[5px] border border-[#BFE8E7] px-4 py-2`}
          >
            <IoFilter className="text-lg" />
            <span className="font-medium">{isAr ? "حدد عوامل التصفية" : "Select Filters"}</span>
          </button>
        </div>

        {/* Content area */}
        <div className={`grid gap-10 ${open ? "lg:grid-cols-[320px_1fr]" : ""}`}>
          <AnimatePresence initial={false}>
            {open && (
              <motion.aside
                key="filters"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "100%", opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="rounded-[5px] p-6 border border-primary/40 bg-transparent shadow-sm">
                  <FilterSection title={isAr ? "فئات" : "Categories"}>
                    {categoryOptions.map((opt) => (
                      <label key={opt.slug} className="FilterItem">
                        <RoundCheck checked={categorySet.has(opt.slug)} onChange={() => setCategorySet((s) => toggleSet(s, opt.slug))} />
                        <span className="grow">{isAr ? opt.ar_name : opt.en_name}</span>
                      </label>
                    ))}
                  </FilterSection>

                  <FilterSection title={isAr ? "المستلمون" : "Recipients"}>
                    {recipientOptions.map((opt) => (
                      <label key={opt.slug} className="FilterItem">
                        <RoundCheck checked={recipientsSet.has(opt.slug)} onChange={() => setRecipientsSet((s) => toggleSet(s, opt.slug))} />
                        <span className="grow">{isAr ? opt.ar_name : opt.en_name}</span>
                      </label>
                    ))}
                  </FilterSection>

                  <FilterSection title={isAr ? "الألوان" : "Colors"}>
                    {colorOptions.map((c) => (
                      <label key={c.slug} className="FilterItem">
                        <RoundCheck checked={colorsSet.has(c.slug)} onChange={() => setColorsSet((s) => toggleSet(s, c.slug))} />
                        <span className="grow">{isAr ? c.ar_name : c.en_name}</span>
                      </label>
                    ))}
                  </FilterSection>

                  <FilterSection title={isAr ? "العلامات التجارية" : "Brands"}>
                    {brandOptions.map((b) => (
                      <label key={b.slug} className="FilterItem">
                        <RoundCheck checked={brandsSet.has(b.slug)} onChange={() => setBrandsSet((s) => toggleSet(s, b.slug))} />
                        <span className="grow">{isAr ? b.ar_name : b.en_name}</span>
                      </label>
                    ))}
                  </FilterSection>

                  <FilterSection title={isAr ? "المناسبات" : "Occasions"}>
                    {occasionOptions.map((o) => (
                      <label key={o.slug} className="FilterItem">
                        <RoundCheck checked={occasionsSet.has(o.slug)} onChange={() => setOccasionsSet((s) => toggleSet(s, o.slug))} />
                        <span className="grow">{isAr ? o.ar_name : o.en_name}</span>
                      </label>
                    ))}
                  </FilterSection>

                  <FilterSection title={isAr ? "السعر" : "Price"}>
                    <label className="FilterItem">
                      <RoundRadio name="price" checked={priceSort === "hl"} onChange={() => setPriceSort((v) => (v === "hl" ? "" : "hl"))} />
                      <span className="grow">{isAr ? "عالي إلى منخفض" : "High to low"}</span>
                    </label>
                    <label className="FilterItem">
                      <RoundRadio name="price" checked={priceSort === "lh"} onChange={() => setPriceSort((v) => (v === "lh" ? "" : "lh"))} />
                      <span className="grow">{isAr ? "منخفض إلى عالي" : "Low to high"}</span>
                    </label>
                  </FilterSection>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Products grid */}
          <section>
            {open && (
              <button
                onClick={clearClientFilters}
                className="border-primary/30 mb-4 border-[1px] rounded-[5px] py-2 px-4 text-black flex items-center gap-2"
              >
                <RxCross1 size={16} color="#0FB4BB" /> {isAr ? "مسح المرشحات" : "Clear Filters"}
              </button>
            )}

            {loading ? (
              <div className={`grid gap-6 sm:grid-cols-2 md:grid-cols-2 ${open ? "lg:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"}`}>
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl border p-4 h-64 bg-gray-50" />
                ))}
              </div>
            ) : err ? (
              <div className="text-red-600">{err}</div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-gray-500 text-lg">
                {isAr ? "لا توجد منتجات." : "No Products Found."}
              </div>
            ) : (
              <>
                <div className={`grid gap-6 sm:grid-cols-2 md:grid-cols-2 ${open ? "lg:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"}`}>
                  {filtered.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>

                {/* Pagination (server) */}
                <Stack spacing={2} style={{ direction: "ltr" }} className="mt-20 flex items-center justify-center">
                  <Pagination count={serverPage.totalPages || 1} page={page} onChange={(_, p) => setPage(p)} color="primary" />
                </Stack>
              </>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}

/* ---------- Small Components ---------- */
function FilterSection({ title, children }) {
  return (
    <div className="mb-8">
      <div className="text-primary font-semibold text-xl mb-4">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function RoundCheck({ checked, onChange, readOnly }) {
  return (
    <span className="relative inline-flex items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        readOnly={readOnly}
        className="peer h-5 w-5 appearance-none rounded-full border border-[#BFE8E7] bg-white outline-none cursor-pointer checked:bg-[#18B2AF] transition"
      />
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100">
        <path fill="currentColor" d="M20.285 6.708a1 1 0 0 1 .007 1.414l-9 9a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414l3.293 3.293 8.293-8.293a1 1 0 0 1 1.407 0z" />
      </svg>
    </span>
  );
}

function RoundRadio({ name, checked, onChange }) {
  return (
    <span className="relative inline-flex items-center justify-center">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer h-5 w-5 appearance-none rounded-full border border-[#BFE8E7] bg-white outline-none cursor-pointer checked:border-[#18B2AF] transition"
      />
      <span className="pointer-events-none absolute h-2.5 w-2.5 rounded-full bg-[#18B2AF] opacity-0 peer-checked:opacity-100" />
    </span>
  );
}

/* Inline styles (unchanged) */
const styles = `
  .FilterItem{display:flex;align-items:center;gap:.6rem;padding:.6rem .8rem;border:1px solid #BFE8E7;border-radius:12px;background:#fff}
  .FilterItem:hover{border-color:#18B2AF}
`;
if (typeof document !== "undefined" && !document.getElementById("local-styles")) {
  const style = document.createElement("style");
  style.id = "local-styles";
  style.innerHTML = styles;
  document.head.appendChild(style);
}
