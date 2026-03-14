// @ts-nocheck
// client/src/pages/GiftDetail/GiftDetail.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { CiDeliveryTruck } from "react-icons/ci";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineWorkspacePremium } from "react-icons/md";
import { TbShoppingCart } from "react-icons/tb";
import FrequentlyBuyGifts from "./FrequentlyBuyGifts";
import { useTranslation } from "react-i18next";
import { useGiftDetail } from "../../hooks/products/useProducts";
import { useParams } from "next/navigation";
import ClipLoader from "react-spinners/ClipLoader";
import { useCartFlag } from "../../context/CartContext";

import { useCartByUser } from "../../hooks/cart/useCart";
import {
  useAddItemToCart,
  useRemoveItemFromCart,
} from "../../hooks/cart/useCartMutation";

import Button from "../Button";
import ToastNotification from "../ToastNotification"; // 👈 path adjust if needed

const ProductDetail = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { id } = useParams();
  const { setUpdate } = useCartFlag();

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const imgWrapRef = useRef(null);
  const [isMagnifying, setIsMagnifying] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });

  // ---- toast state (reusable component) ----
  const [toastState, setToastState] = useState({
    open: false,
    type: "success", // "success" | "error"
    message: "",
  });

  const showToast = (message, type = "success") => {
    setToastState({ open: true, type, message });
  };

  const LENS_SIZE = 160;
  const ZOOM = 2.2;

  const { data: product, isLoading } = useGiftDetail(id);

  // user id from localStorage
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user"));
      if (stored?.user?._id) setUserId(stored.user._id);
    } catch {
      setUserId(null);
    }
  }, []);

  // cart state
  const {
    data: cartRes,
    isLoading: cartLoading,
    isFetching: cartFetching,
  } = useCartByUser(userId);

  const cartItems = useMemo(
    () =>
      cartRes?.data?.items && Array.isArray(cartRes.data.items)
        ? cartRes.data.items
        : [],
    [cartRes]
  );

  const inCart = useMemo(() => {
    const pid = String(product?._id || "");
    return cartItems.some(
      (it) => String(it?.product?._id ?? it?.product) === pid
    );
  }, [cartItems, product?._id]);

  const { mutateAsync: addItemToCart, isPending: addPending } =
    useAddItemToCart();
  const { mutateAsync: removeItemFromCart, isPending: removePending } =
    useRemoveItemFromCart();

  const resolvingCart = cartLoading || cartFetching;
  const mainBtnDisabled = resolvingCart || addPending || removePending;

  // magnifier handlers
  const handleMouseEnter = () => setIsMagnifying(true);
  const handleMouseLeave = () => setIsMagnifying(false);
  const handleMouseMove = (e) => {
    const wrap = imgWrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const half = LENS_SIZE / 2;
    setLensPos({
      x: Math.max(half, Math.min(relX, rect.width - half)),
      y: Math.max(half, Math.min(relY, rect.height - half)),
    });
  };
  const backgroundSize = (wrap) =>
    wrap
      ? `${wrap.clientWidth * ZOOM}px ${wrap.clientHeight * ZOOM}px`
      : "auto";
  const backgroundPosition = `${-(lensPos.x * ZOOM - LENS_SIZE / 2)}px ${-(
    lensPos.y * ZOOM -
    LENS_SIZE / 2
  )}px`;

  /* ---------- Derived product fields ---------- */

  const title = isAr ? product?.ar_title || product?.title : product?.title;

  const currency = product?.currency || "QAR";

  const basePriceRaw =
    typeof product?.price === "number"
      ? product.price
      : product?.price?.sale || 0;
  const basePrice = Number(basePriceRaw || 0);

  const discountedPriceRaw =
    typeof product?.priceAfterDiscount === "number"
      ? product.priceAfterDiscount
      : basePrice;
  const discountedPrice = Number(discountedPriceRaw || 0);

  const hasDiscount =
    discountedPrice > 0 && basePrice > 0 && discountedPrice < basePrice;

  const explicitDiscount =
    typeof product?.discount === "number" && product.discount > 0
      ? product.discount
      : 0;

  const discountPercent = hasDiscount
    ? explicitDiscount ||
      Math.round(((basePrice - discountedPrice) / basePrice) * 100)
    : 0;

  const priceMainText = `${currency} ${(hasDiscount
    ? discountedPrice
    : basePrice
  ).toLocaleString()}`;
  const priceOriginalText = hasDiscount
    ? `${currency} ${basePrice.toLocaleString()}`
    : null;

  const imageUrls =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images.map((img) => img?.url).filter(Boolean)
      : product?.featuredImage
      ? [product.featuredImage]
      : [];

  const htmlDescription = isAr
    ? product?.ar_description || product?.description || ""
    : product?.description || product?.ar_description || "";

  const stockText = `${product?.remainingStocks ?? 0} ${
    isAr ? "متوفر" : "in stock"
  }`;

  const categoryText =
    product?.categories?.[0]?.[isAr ? "ar_name" : "name"] ||
    product?.type?.[isAr ? "ar_name" : "name"] ||
    (isAr ? "فئة" : "Category");

  const conditionText = product?.condition || (isAr ? "جديد" : "new");

  const arrangements = Array.isArray(product?.arrangements)
    ? product.arrangements
    : [];

  const brandName = isAr
    ? product?.brand?.ar_name || product?.brand?.name
    : product?.brand?.name;
  const brandCountry = product?.brand?.countryCode;

  const totalStocks = Number(product?.totalStocks ?? 0);
  const remainingStocks = Number(product?.remainingStocks ?? 0);
  const totalPieceSold = Number(product?.totalPieceSold ?? 0);

  const colors = Array.isArray(product?.colors) ? product.colors : [];
  const occasions = Array.isArray(product?.occasions) ? product.occasions : [];
  const recipients = Array.isArray(product?.recipients)
    ? product.recipients
    : [];

  const stockStatus = product?.stockStatus || "in_stock";

  const stockStatusLabel = (() => {
    switch (stockStatus) {
      case "low_stock":
        return isAr ? "كمية قليلة" : "Low stock";
      case "out_of_stock":
        return isAr ? "غير متوفر" : "Out of stock";
      default:
        return isAr ? "متوفر" : "In stock";
    }
  })();

  const stockStatusClass = (() => {
    switch (stockStatus) {
      case "low_stock":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "out_of_stock":
        return "bg-rose-50 text-rose-600 border-rose-200";
      default:
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
    }
  })();

  // stock logic for type-based
  const hasEnoughTypeStock = useMemo(() => {
    const carry = Number(product?.totalPieceCarry || 0);
    if (!Array.isArray(product?.type) || product.type.length === 0) return true;
    return product.type.some((t) => {
      const rem = Number(
        (t && typeof t === "object" ? t.remainingStock : null) ?? Infinity
      );
      return rem > carry;
    });
  }, [product?.type, product?.totalPieceCarry]);

  const isOutOfStock = product?.stockStatus === "out_of_stock";
  const canAddToCart = !isOutOfStock && hasEnoughTypeStock;

  // cart handlers
  const handleAddToCart = async () => {
    if (!userId) {
      showToast(
        isAr
          ? "الرجاء تسجيل الدخول لاستخدام عربة التسوق"
          : "Please login to use cart",
        "error"
      );
      return;
    }

    if (!product?._id) return;

    await addItemToCart({ user: userId, product: product._id, qty: 1 });
    setUpdate((u) => !u);
    showToast(isAr ? "أُضيفت إلى السلة" : "Added to cart", "success");
  };

  const handleRemoveFromCart = async () => {
    if (!userId || !product?._id) return;
    await removeItemFromCart({ user: userId, productId: product._id });
    setUpdate((u) => !u);
    showToast(isAr ? "أُزيلت من السلة" : "Removed from cart", "success");
  };

  /* ================= RENDER ================= */

  if (isLoading) {
    return (
      <section className="py-10">
        <div className="custom-container">
          <div className="flex items-center justify-center h-64">
            <ClipLoader color="#0fb4bb" size={50} />
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="py-10">
        <div className="custom-container">
          <div className="text-center text-red-600">Product not found.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10">
      {/* Global toast for this page */}
      <ToastNotification
        open={toastState.open}
        type={toastState.type}
        title={toastState.type === "success" ? "Success" : "Oops!"}
        message={toastState.message}
        duration={3000}
        onClose={() =>
          setToastState((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />

      <div className="custom-container">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Images + magnifier */}
          <div className="relative md:w-1/2 xl:w-[40%]">
            <div
              ref={imgWrapRef}
              className="relative w-full rounded-xl h-[500px] overflow-hidden"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              {imageUrls[activeImgIndex] ? (
                <>
                  <img
                    src={imageUrls[activeImgIndex]}
                    alt="Product"
                    className="w-full h-full object-cover select-none pointer-events-none"
                    draggable={false}
                  />
                  <span className="-rotate-[45deg] font-medium absolute top-6 -left-[6rem] bg-green-500 text-white px-28 py-2 rounded-[0px]">
                    {product?.isFeatured ? "Featured" : "Not Featured"}
                  </span>
                </>
              ) : (
                <div className="w-full h-full grid place-items-center text-primary/60">
                  No image
                </div>
              )}

              {isMagnifying && imageUrls[activeImgIndex] && (
                <div
                  className="pointer-events-none rounded-full border border-white/70 shadow-xl"
                  style={{
                    position: "absolute",
                    width: `${LENS_SIZE}px`,
                    height: `${LENS_SIZE}px`,
                    top: `${lensPos.y - LENS_SIZE / 2}px`,
                    left: `${lensPos.x - LENS_SIZE / 2}px`,
                    backgroundImage: `url(${imageUrls[activeImgIndex]})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: backgroundSize(imgWrapRef.current),
                    backgroundPosition,
                    boxShadow:
                      "0 10px 25px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.3)",
                    backdropFilter: "blur(0.5px)",
                  }}
                />
              )}
            </div>

            {imageUrls.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="grid grid-cols-3 gap-3">
                  {imageUrls.map((image, index) => (
                    <div className="relative" key={index}>
                      <img
                        src={image}
                        alt={`Additional Product ${index + 1}`}
                        className={`${
                          activeImgIndex === index
                            ? "border-2 border-primary"
                            : ""
                        } rounded-lg object-cover lg:w-[80px] lg:h-[80px] h-[60px] cursor-pointer w-[60px]`}
                        onClick={() => setActiveImgIndex(index)}
                      />
                      <div
                        className={`absolute top-0 left-0 w-full h-full bg-black/50 rounded-lg ${
                          activeImgIndex === index ? "" : "hidden"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 mt-4 md:mt-0 md:w-1/2 xl:w-[60%]">
            {/* Title + Price + Badges */}
            <div className="flex items-start justify-between gap-4">
              <h5 className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-primary">
                {title}
              </h5>

              <div className="flex items-center gap-2 mt-3">
                {hasDiscount && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-50 text-rose-500 text-[11px] font-semibold">
                    {discountPercent}% {isAr ? "خصم" : "OFF"}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1 my-4">
              <p className="lg:text-lg xl:text-2xl font-semibold text-primary">
                {priceMainText}
              </p>
              {priceOriginalText && (
                <p className="text-xs lg:text-sm text-gray-600 line-through">
                  {priceOriginalText}
                </p>
              )}
            </div>

            {/* Stock & Brand stats grid */}
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-primary/15 bg-primary_light_mode/10 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">
                  {isAr ? "إجمالي المخزون" : "Total Stock"}
                </p>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {totalStocks || "-"}
                </p>
              </div>
              <div className="rounded-xl border border-primary/15 bg-primary_light_mode/10 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">
                  {isAr ? "المتبقي" : "Remaining"}
                </p>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {remainingStocks || "-"}
                </p>
              </div>
              <div className="rounded-xl border border-primary/15 bg-primary_light_mode/10 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">
                  {isAr ? "تم بيعها" : "Pieces Sold"}
                </p>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {totalPieceSold || "-"}
                </p>
              </div>
            </div>

            {/* Additional meta */}
            <div className="mt-5 space-y-2 text-[13px] text-gray-700">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] tracking-wide text-primary font-medium">
                  {isAr ? "حالة المخزون" : "Stock"}
                </p>
                <span
                  className={[
                    "mt-1 inline-flex px-4 py-1 ms-14 rounded-full border text-[11px] font-medium",
                    stockStatusClass,
                  ].join(" ")}
                >
                  {stockStatusLabel}
                </span>
              </div>

              {brandName && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-primary min-w-[90px]">
                    {isAr ? "العلامة:" : "Brand:"}
                  </span>
                  <span className="px-3 py-1 font-medium rounded-full bg-white border border-primary/20 text-primary text-xs">
                    {brandName}
                  </span>
                </div>
              )}

              {colors.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="font-medium text-primary min-w-[90px]">
                    {isAr ? "الألوان:" : "Colors:"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                      <span
                        key={c._id}
                        className="font-medium px-3 py-1 rounded-full border border-primary/15 bg-white text-[11px]"
                      >
                        {isAr ? c?.ar_name || c?.name : c?.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {occasions.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="font-medium text-primary min-w-[90px]">
                    {isAr ? "المناسبات:" : "Occasions:"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {occasions.map((o) => (
                      <span
                        key={o._id}
                        className="font-medium px-3 py-1 rounded-full border border-primary/15 bg-white text-[11px]"
                      >
                        {isAr ? o?.ar_name || o?.name : o?.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {recipients.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="font-medium text-primary min-w-[90px]">
                    {isAr ? "لمن:" : "For:"}
                  </span>
                  <div className="font-medium flex flex-wrap gap-2">
                    {recipients.map((r) => (
                      <span
                        key={r._id}
                        className="font-medium px-3 py-1 rounded-full border border-primary/15 bg-white text-[11px]"
                      >
                        {isAr ? r?.ar_name || r?.name : r?.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mt-8 bg-neutral-50 border border-neutral-100 rounded-2xl p-6 shadow-sm">
              <h5 className="text-primary font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                {isAr ? "الوصف" : "Description"}
              </h5>
              <div
                className="text-gray-800 text-[15px] leading-relaxed prose max-w-none prose-p:text-gray-800 prose-headings:text-primary [&_*]:!text-gray-800"
                dangerouslySetInnerHTML={{ __html: htmlDescription }}
              />
              {product?.note && (
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-amber-500 font-bold mt-0.5">ⓘ</span>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    <span className="font-semibold text-amber-800">
                      {isAr ? "ملاحظة: " : "Note: "}
                    </span>
                    {product.note}
                  </p>
                </div>
              )}
            </div>

            {arrangements.length > 0 && (
              <div className="mt-6 bg-neutral-50 border border-neutral-100 rounded-2xl p-6 shadow-sm">
                <h6 className="text-primary font-semibold text-lg mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                  {isAr ? "يتضمن الترتيب:" : "Arrangement Includes"}
                </h6>
                <ul className="grid grid-cols-1 gap-3">
                  {arrangements.map((a, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-800 text-[15px] font-medium bg-white border border-neutral-200 rounded-lg p-3 shadow-sm hover:border-primary/40 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      {isAr ? a?.ar || a?.en || a : a?.en || a?.ar || a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product?.sku && (
              <div className="sku mt-6">
                <h5 className="font-medium text-primary text-xl">
                  {isAr ? "رمز المنتج: " : "SKU: "}
                  {product.sku}
                </h5>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex xl:w-1/2 items-center gap-4 mt-4">
              {resolvingCart ? (
                <button
                  className="border border-primary bg-primary_light_mode text-center w-1/2 font-medium text-primary py-3 px-4 rounded-lg mt-6 flex items-center justify-center gap-2 opacity-60"
                  disabled
                >
                  <ClipLoader size={18} color="#0fb4bb" />
                  {isAr ? "جاري التحقق..." : "Checking..."}
                </button>
              ) : canAddToCart ? (
                inCart ? (
                  <button
                    onClick={handleRemoveFromCart}
                    disabled={mainBtnDisabled}
                    className="border text-white bg-red-500 hover:bg-red-600 border-red-500 text-center font-medium py-3 px-4 rounded-lg mt-6 flex items-center justify-center gap-2 w-1/2"
                  >
                    <TbShoppingCart size={20} />
                    {isAr ? "إزالة من السلة" : "Remove From Cart"}
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={mainBtnDisabled}
                    className="border border-primary bg-primary_light_mode hover:bg-primary_light_mode/10 text-center w-1/2 font-medium text-primary py-3 px-4 rounded-lg mt-6 flex items-center justify-center gap-2"
                  >
                    <TbShoppingCart size={20} />
                    {isAr ? "إضافة إلى السلة" : "Add to Cart"}
                  </button>
                )
              ) : (
                <Button
                  disabled
                  label={isAr ? "إنتهى من المخزن" : "Out Of Stock"}
                  isBgColor={true}
                />
              )}
            </div>
          </div>
        </div>

        {product?.suggestedProducts?.length > 0 && (
          <div className="mt-20">
            <h3 className="text-3xl text-primary">
              {isAr
                ? "المنتجات الأكثر شراءًا معاً"
                : "Frequently Bought Together"}
            </h3>
            <div className="mt-4 border border-primary rounded-3xl">
              <FrequentlyBuyGifts
                data={product}
                product={product?.suggestedProducts}
                userId={userId}
                onToast={showToast} // same showToast (success/error)
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDetail;
