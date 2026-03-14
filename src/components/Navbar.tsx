"use client";
import React, { useEffect, useRef, useState } from "react";
import { FiMenu, FiSearch, FiHeart, FiUser } from "react-icons/fi";
import { PiShoppingCartSimpleLight } from "react-icons/pi";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import MenuListBox from "./MenuListBox";
import BottomNavigation from "./BottomNavigation";
import { getCartLength } from "../api/cart";
import { useCartFlag } from "../context/CartContext";
import { searchProducts } from "../api/products"; // ✅ NEW

const CART_KEY = "cart";

export default function Navbar() {
  const { t } = useTranslation("translation");
  const { i18n } = useTranslation();

  const isArabic = i18n.language === "ar"

  const dir = (t("dir") || "ltr") as "ltr" | "rtl";
  const location = usePathname();
  const navigate = useRouter();

  const { update } = useCartFlag();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const data = JSON.parse(storedUser);
        setUser(data.user || data); // Handle both {user: ...} and direct user object structures
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // ✅ Search state
  const [q, setQ] = useState("");
  const [openSearchPanel, setOpenSearchPanel] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Cart Length via API (server-side cart)
  useEffect(() => {
    if (!user?._id || user?._id === "undefined" || user?._id === "null") {
      setCartCount(0);
      return;
    }
    (async () => {
      const res = await getCartLength(user?._id);
      setCartCount(res?.data?.distinct || 0);
    })();
  }, [location, update, user?._id]);

  /* ---------- helpers ---------- */
  const readCartCount = () => {
    try {
      const arr = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(arr) ? arr.length : 0;
    } catch {
      return 0;
    }
  };

  /* ---------- dir sync ---------- */
  useEffect(() => {
    document.documentElement.dir = dir;
  }, [dir]);

  /* ---------- monkey-patch: fire custom event on same-tab updates ---------- */
  useEffect(() => {
    const _setItem = localStorage.setItem;
    localStorage.setItem = function (key: string, value: string) {
      _setItem.call(this, key, value);
      if (key === CART_KEY) {
        window.dispatchEvent(new Event("cart:updated"));
      }
      if (key === "user") {
        window.dispatchEvent(new Event("user:updated"));
      }
    };
    return () => {
      localStorage.setItem = _setItem;
    };
  }, []);

  /* ---------- hydrate on mount ---------- */
  useEffect(() => {
    setCartCount(readCartCount());
  }, []);

  /* ---------- also refresh on route change (fallback) ---------- */
  useEffect(() => {
    setCartCount(readCartCount());
  }, [location]);

  /* ---------- listen to cross-tab + custom events ---------- */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) setCartCount(readCartCount());
      if (e.key === "user") {
          const stored = localStorage.getItem("user");
          if (stored) {
             const data = JSON.parse(stored);
             setUser(data.user || data);
          } else {
             setUser(null);
          }
      }
    };
    const onCustomCart = () => setCartCount(readCartCount());
    const onCustomUser = () => {
        const stored = localStorage.getItem("user");
        if (stored) {
             const data = JSON.parse(stored);
             setUser(data.user || data);
        } else {
             setUser(null);
        }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("cart:updated", onCustomCart);
    window.addEventListener("user:updated", onCustomUser);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cart:updated", onCustomCart);
      window.removeEventListener("user:updated", onCustomUser);
    };
  }, []);

  /* ---------- active states for buttons (only style) ---------- */
  const isCart = location?.includes("cart") || false;
  const isWishlist = location?.includes("wishlist") || false;
  const isMember = location?.includes("member") || false;

  /* ---------- Search: click outside to close ---------- */
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!panelRef.current || !inputRef.current) return;
      if (
        (panelRef.current as any).contains(e.target) ||
        (inputRef.current as any).contains(e.target)
      )
        return;
      setOpenSearchPanel(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  /* ---------- Search: debounced fetch with cancel ---------- */
  useEffect(() => {
    setSearchError("");

    if (!q.trim()) {
      setSearchResults([]);
      setOpenSearchPanel(false);
      abortRef.current?.abort?.();
      return;
    }

    const t = setTimeout(async () => {
      abortRef.current?.abort?.();
      const controller = new AbortController();
      abortRef.current = controller;

      setSearchLoading(true);
      try {
        const data = await searchProducts(q, {
          limit: 8,
          signal: controller.signal,
        });
        setSearchResults(data?.items || []);
        setOpenSearchPanel(true);
      } catch (err: any) {
        // ignore aborts
        if (err?.name !== "CanceledError" && err?.message !== "canceled") {
          console.error(err);
          setSearchError("Failed to search. Try again.");
          setOpenSearchPanel(true);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 350); // debounce

    return () => clearTimeout(t);
  }, [q]);

  /* ---------- Search: keyboard handling ---------- */
  const onSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && q.trim()) {
      setOpenSearchPanel(false);
      navigate.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }
    if (e.key === "Escape") {
      setOpenSearchPanel(false);
      inputRef.current?.blur();
    }
  };

  return (
    <nav className="navbar sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300 py-2">
      <div className="custom-container px-4">
        <div className="flex items-center lg:justify-between md:justify-between justify-center lg:gap-0 gap-4">
          {/* Left cluster */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="relative border-b border-primary_light_mode flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-neutral-700 shadow-sm ring-1 ring-[#0FB4BB1A] hover:bg-neutral-50 transition-colors"
              aria-label={t("navbar.menu")}
            >
              <FiMenu className="text-[16px] text-primary" />
              <span className="hidden sm:inline text-black font-medium">
                {t("navbar.menu")}
              </span>
            </button>

            {/* Search pill + Dropdown */}
            <div className="relative w-[200px] xl:w-[280px]">
              <div className="border-b border-primary_light_mode hidden lg:flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-neutral-700 shadow-sm ring-1 ring-[#0FB4BB1A]">
                <FiSearch className="text-[16px] text-primary" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={t("navbar.search")}
                  className="w-full bg-transparent outline-none placeholder:text-black placeholder:font-medium"
                  aria-label={t("navbar.search")}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  onFocus={() => q.trim() && setOpenSearchPanel(true)}
                />
              </div>

              {/* Results dropdown */}
              <AnimatePresence>
                {openSearchPanel && (
                  <motion.div
                    ref={panelRef}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 mt-2 w-full hidden lg:block"
                  >
                    <div className="rounded-xl border border-neutral-200 bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
                      {/* Loading */}
                      {searchLoading && (
                        <div className="px-4 py-3 text-sm text-neutral-500">
                          {t("search.loading") || "Searching…"}
                        </div>
                      )}

                      {/* Error */}
                      {!searchLoading && searchError && (
                        <div className="px-4 py-3 text-sm text-red-600">
                          {searchError}
                        </div>
                      )}

                      {/* Results */}
                      {!searchLoading && !searchError && (
                        <>
                          {searchResults.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-neutral-600">
                              {"No items found"}
                            </div>
                          ) : (
                            <ul className="max-h-[360px] overflow-auto divide-y divide-neutral-100">
                              {searchResults.map((p) => (
                                <li key={p._id}>
                                  <Link
                                    href={`/gift-detail/${p._id}`}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50"
                                    onClick={() => setOpenSearchPanel(false)}
                                  >
                                    {/* thumbnail */}
                                    <div className="w-10 h-10 shrink-0 rounded-md overflow-hidden bg-neutral-100 border border-neutral-200">
                                      {p?.featuredImage ? (
                                        <img
                                          src={p.featuredImage}
                                          alt={p.title}
                                          className="w-full h-full object-cover"
                                          loading="lazy"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">
                                          IMG
                                        </div>
                                      )}
                                    </div>
                                    {/* text */}
                                    <div className="min-w-0">
                                      <div className="truncate font-medium text-sm text-neutral-900">
                                        {isArabic ? p.ar_title : p.title}
                                      </div>
                                      <div className="truncate text-xs text-neutral-500">
                                        {(p?.currency || "QAR") +
                                          " " +
                                          Number(
                                            p?.price || 0
                                          ).toLocaleString()}
                                      </div>
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* Footer: view all */}
                          {searchResults.length > 0 && (
                            <div className="px-4 py-2 bg-neutral-50 text-right">
                              <Link
                                href={`/filters/q/${encodeURIComponent(
                                  q.trim()
                                )}`}
                                onClick={() => setOpenSearchPanel(false)}
                                className="text-sm font-medium text-primary hover:underline"
                              >
                                {"View all results"}
                              </Link>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Center logo */}
          <Link href={`/`} className="lg:me-0 md:me-16 flex items-center gap-2">
            <img
              src="/images/flower-bloom-logo.png"
              alt="Flower Bloom"
              className="h-10 md:h-12 w-auto object-contain"
            />
            <h1 className="text-[1rem] md:text-[1.4rem] lg:text-[1.2rem] xl:text-2xl font-bold text-primary uppercase tracking-wide">
              {t("logo")}
            </h1>
          </Link>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            {/* CART */}
            <Link
              href={user?._id ? `/cart/${user._id}` : "/login"}
              className={`${
                isCart ? "bg-primary" : "bg-transparent"
              } relative overflow-visible border-b border-primary_light_mode hidden lg:flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-black shadow-sm ring-1 ring-[#0FB4BB1A] hover:bg-neutral-50 transition-colors`}
              aria-label={t("navbar.cart")}
            >
              {cartCount > 0 && (
                <span
                  className={[
                    "absolute",
                    dir === "rtl" ? "-top-1.5 -left-1.5" : "-top-1.5 -right-1.5",
                    "min-w-[16px] h-[16px] flex items-center justify-center",
                    "rounded-full text-[9px] font-bold",
                    "bg-black text-white border border-white/70 shadow-sm",
                    "pointer-events-none z-10",
                  ].join(" ")}
                  aria-label={`${cartCount} ${t("navbar.items") || "items"}`}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}

              <PiShoppingCartSimpleLight
                className={`text-[18px] ${
                  isCart ? "text-white" : "text-primary"
                }`}
              />
              <span
                className={`font-medium ${
                  isCart ? "text-white" : "text-black"
                }`}
              >
                {t("navbar.cart")}
              </span>
            </Link>

            <Link
              href={user?._id ? `/member/${user._id}/wishlist` : "/login"}
              className={`${
                isWishlist ? "bg-primary" : "bg-transparent"
              } border-b border-primary_light_mode hidden lg:flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-black shadow-sm ring-1 ring-[#0FB4BB1A] hover:bg-neutral-50 transition-colors`}
              aria-label={t("navbar.favorite")}
            >
              <FiHeart
                className={`text-[16px] ${
                  isWishlist ? "text-white" : "text-primary"
                }`}
              />
              <span
                className={`font-medium ${
                  isWishlist ? "text-white" : "text-black"
                }`}
              >
                {t("navbar.favorite")}
              </span>
            </Link>

            <Link
              href={user?._id ? `/member/${user._id}/profile` : "/login"}
              className={`${
                isMember ? "bg-primary" : "bg-transparent"
              } border-b border-primary_light_mode hidden lg:flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-black shadow-sm ring-1 ring-[#0FB4BB1A] hover:bg-neutral-50 transition-colors`}
              aria-label={t("navbar.member")}
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <FiUser
                  className={`text-[16px] ${
                    isMember ? "text-white" : "text-primary"
                  }`}
                />
              )}
              <span
                className={`font-medium ${
                  isMember ? "text-white" : "text-black"
                }`}
              >
                {t("navbar.member")}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Drawer + Backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <MenuListBox
              key="drawer"
              dir={dir}
              onClose={() => setMenuOpen(false)}
              onLinkClick={() => setMenuOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      <div className="md:hidden block">
        <BottomNavigation />
      </div>
    </nav>
  );
}
