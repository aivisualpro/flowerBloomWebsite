// client/src/pages/Cart/Cart.jsx
import React, { useEffect, useMemo, useState } from "react";
import CartItem from "./CartItem";
import PreviewModal from "./PreviewModal";
import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiTruck,
  FiPhone,
  FiGift,
  FiX,
  FiPlusCircle,
} from "react-icons/fi";
import { useCartFlag } from "../../context/CartContext";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { MdArrowForwardIos, MdOutlineArrowBackIos } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { ClipLoader } from "react-spinners";
import { FormControl, Select, MenuItem } from "@mui/material";
import { loadStripe } from "@stripe/stripe-js";

import { useCartByUser } from "../../hooks/cart/useCart";
import {
  useSetItemQty,
  useRemoveItemFromCart,
} from "../../hooks/cart/useCartMutation";
import { checkCoupon } from "../../api/coupon";
import { createOrder, getOnGoingOrderByUser } from "../../api/order";

import ToastNotification from "../../components/ToastNotification"; // 👈 toast component
import { BASE_URL } from "../../api/config";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_VITE_STRIPE_PUBLISHED_KEY || "");

const CURRENCY = (n: number | string) => `QAR ${Number(n || 0).toLocaleString()}`;
const PANEL_RING = "ring-1 ring-primary/10";
const ORDER_CODE_KEY = "last_order_code";
const MIN_START = 161; // yahan se counting start karni hai

const round2 = (n: number | string) =>
  Math.max(0, Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100);

/* Generates a code like SA-2025-000121 and persists last used in localStorage. */
function nextOrderCode(prefix = "SA") {
  const year = new Date().getFullYear();
  const stored = localStorage.getItem(ORDER_CODE_KEY);

  let lastNum = MIN_START - 1; // default 159

  if (stored) {
    const m = stored.match(/^([A-Z]+)-(\d{4})-(\d{6})$/);
    if (m) {
      const n = parseInt(m[3], 10);
      // ensure kabhi 160 se kam pe na chalay
      lastNum = Math.max(n, MIN_START - 1);
    }
  }

  const newNum = lastNum + 1; // always >= 160
  const code = `${prefix}-${year}-${String(newNum).padStart(6, "0")}`;

  localStorage.setItem(ORDER_CODE_KEY, code);
  return code;
}

interface Coupon {
  code: string;
  type: string;
  value: number;
}

/* =============================================================== */

export default function Cart() {
  const { i18n } = useTranslation();
  const langClass = i18n.language === "ar";
  const { setUpdate } = useCartFlag();
  const params = useParams();
  const id = params?.id as string; // userId from route

  const [localUser, setLocalUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
           const parsed = JSON.parse(stored);
           setLocalUser(parsed.user || parsed);
        }
      } catch (e) {
        console.error("Failed to read user from localStorage", e);
      }
    }
  }, []);

  const user = localUser;

  const navigate = useRouter();

  // ---- Toast state (using reusable ToastNotification) ----
  const [toastState, setToastState] = useState({
    open: false,
    type: "success", // "success" | "error"
    message: "",
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastState({
      open: true,
      type,
      message: msg,
    });
  };

  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderMessage, setorderMessage] = useState("");

  // CART items
  const [items, setItems] = useState<any[]>([]);

  // sender + recipients
  const [senderPhone, setSenderPhone] = useState("");

  // recipients: [{ tempId, label, phone, cardMessage }]
  const [recipients, setRecipients] = useState([
    {
      tempId: "r1",
      label: "Recipient 1",
      phone: "",
      cardMessage: "",
    },
  ]);

  // item allocations:
  // { [itemId]: [{ recipientTempId, quantity }] }
  const [itemAllocations, setItemAllocations] = useState<{ [key: string]: any[] }>({});

  const [voucher, setVoucher] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  /* --------------------- Fetch cart from API --------------------- */

  const { data: cartRes, isLoading: cartLoading } = useCartByUser(id);

  useEffect(() => {
    const apiItems = cartRes?.data?.items || [];
    const mapped = apiItems.map((it: any) => {
      const p = it?.product || {};
      return {
        id: String(p?._id || it?.product),
        selected: true,
        qty: Number(it?.qty || 1),
        price: Number(p?.price || 0),
        image: p?.images?.[0]?.url || p?.featuredImage,
        en_title: p?.title || p?.name || "—",
        ar_title: p?.ar_title || p?.title || p?.name || "—",
        productId: String(p?._id || it?.product),
        remainingStocks: Number(p?.remainingStocks ?? 0),
        deliveryCharges: 200,
      };
    });
    setItems(mapped);
  }, [cartRes]);

  /* ----------------------- Derived values ------------------------ */

  const selectedItems = useMemo(() => items.filter((i) => i.selected), [items]);

  const subtotal = useMemo(
    () =>
      selectedItems.reduce(
        (sum, i) => sum + Number(i.price) * Number(i.qty),
        0
      ),
    [selectedItems]
  );

  const delivery = selectedItems.length ? 200 : 0;

  const total = () => {
    const base = subtotal + delivery;
    if (couponMessage && coupon) {
      if (coupon?.type === "percentage") {
        return base - (base * coupon.value) / 100;
      } else {
        return base - coupon.value;
      }
    }
    return base;
  };

  /* ---------------------- Cart mutations ------------------------- */

  const { mutateAsync: setQtyMut, isPending: qtyUpdating } = useSetItemQty();
  const { mutateAsync: removeItemMut, isPending: removing } =
    useRemoveItemFromCart();

  const toggleSelect = (productId: string) =>
    setItems((prev) =>
      prev.map((i) =>
        i.id === productId ? { ...i, selected: !i.selected } : i
      )
    );

  const changeQty = async (productId: string, delta: number) => {
    const item = items.find((i) => i.id === productId);
    if (!item) return;

    const prevQty = Number(item.qty);
    const maxQty = Number(item.remainingStocks || prevQty || 1); // fallback

    const newQty = Math.max(1, Math.min(maxQty, prevQty + delta));
    if (newQty === prevQty) return;

    setItems((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, qty: newQty } : i))
    );

    setItemAllocations((prev) => {
      const forItem = prev[productId] || [];
      return {
        ...prev,
        [productId]: normalizeAllocations(
          newQty,
          forItem,
          recipients[0]?.tempId
        ),
      };
    });

    try {
      await setQtyMut({ user: id, productId: item.productId, qty: newQty });
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.id === productId ? { ...i, qty: prevQty } : i))
      );
      setItemAllocations((prev) => {
        const forItem = prev[productId] || [];
        return {
          ...prev,
          [productId]: normalizeAllocations(
            prevQty,
            forItem,
            recipients[0]?.tempId
          ),
        };
      });
      showToast(
        langClass
          ? "لم يتم تحديث العدد، حاول مرة أخرى"
          : "Could not update quantity, please try again.",
        "error"
      );
    }
  };

  const removeItem = async (productId: string) => {
    const item = items.find((i) => i.id === productId);
    if (!item) return;
    const prev = items;
    setItems((p) => p.filter((i) => i.id !== productId));
    setItemAllocations((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });

    try {
      await removeItemMut({ user: id, productId: item.productId });
      setUpdate((u) => !u);
      showToast(langClass ? "أُزيل من السلة" : "Removed from cart", "success");
    } catch {
      setItems(prev);
      showToast(
        langClass
          ? "تعذر إزالة العنصر من السلة"
          : "Failed to remove item from cart.",
        "error"
      );
    }
  };

  /* ---------------------- Coupon apply --------------------------- */

  const applyCoupon = async (code: string) => {
    try {
      const payload = { code };
      setLoading(true);
      const res = await checkCoupon(payload);
      if (res.success) {
        setCouponMessage(res.message);
        setCoupon(res.coupon);
      } else {
        setCouponMessage("");
        setCoupon(null);
        showToast(res?.message || "Invalid coupon", "error");
      }
    } catch (error) {
      showToast(
        langClass
          ? "تعذر تطبيق القسيمة"
          : "Failed to apply coupon. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* --------------------- Recipients Helpers ---------------------- */

  useEffect(() => {
    setItemAllocations((prev) => {
      const next = { ...prev };
      const itemIds = new Set(items.map((i) => i.id));
      const validRecipients = new Set(recipients.map((r) => r.tempId));

      Object.keys(next).forEach((itemId) => {
        if (!itemIds.has(itemId)) delete next[itemId];
      });

      for (const item of items) {
        const existing = next[item.id] || [];
        const filtered = existing.filter((a) =>
          validRecipients.has(a.recipientTempId)
        );
        next[item.id] = normalizeAllocations(
          item.qty,
          filtered,
          recipients[0]?.tempId
        );
      }

      return next;
    });
  }, [items, recipients]);

  const addRecipient = () => {
    setRecipients((prev) => {
      const idx = prev.length + 1;
      return [
        ...prev,
        {
          tempId: `r${idx}`,
          label: `Recipient ${idx}`,
          phone: "",
          cardMessage: "",
        },
      ];
    });
  };

  const updateRecipientField = (tempId: string, field: string, value: string) => {
    setRecipients((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r))
    );
  };

  const addAllocationRow = (itemId: string, itemQty: number) => {
    setItemAllocations((prev) => {
      const existing = prev[itemId] || [];
      const used = new Set(existing.map((a) => a.recipientTempId));
      const available = recipients.find((r) => !used.has(r.tempId));
      const targetRecipient = available || recipients[0] || { tempId: "r1" };

      const next = [
        ...existing,
        { recipientTempId: targetRecipient.tempId, quantity: 1 },
      ];

      return {
        ...prev,
        [itemId]: normalizeAllocations(itemQty, next, recipients[0]?.tempId),
      };
    });
  };

  const updateAllocationRecipient = (itemId: string, index: number, newTempId: string, itemQty: number) => {
    setItemAllocations((prev) => {
      const list = [...(prev[itemId] || [])];
      if (!list[index]) return prev;
      list[index] = { ...list[index], recipientTempId: newTempId };
      return {
        ...prev,
        [itemId]: normalizeAllocations(itemQty, list, recipients[0]?.tempId),
      };
    });
  };

  const commitAllocationQty = (itemId: string, itemQty: number, recipients: any[]) => {
    setItemAllocations((prev) => {
      const list = [...(prev[itemId] || [])];
      const normalized = normalizeAllocations(
        itemQty,
        list,
        recipients[0]?.tempId
      );

      return {
        ...prev,
        [itemId]: normalized,
      };
    });
  };

  const updateAllocationQty = (itemId: string, index: number, newQtyRaw: string | number, itemQty: number) => {
    const maxQty = Number(itemQty) || 0;

    setItemAllocations((prev) => {
      const list = [...(prev[itemId] || [])];
      if (!list[index]) return prev;

      if (newQtyRaw === "") {
        list[index] = { ...list[index], quantity: "" };
        return { ...prev, [itemId]: list };
      }

      let newQty = Number(newQtyRaw);
      if (!Number.isFinite(newQty) || newQty < 0) newQty = 0;

      list[index] = { ...list[index], quantity: newQty };

      const otherIdxs = list.map((_, i) => i).filter((i) => i !== index);

      let otherSum = 0;
      otherIdxs.forEach((i) => {
        const q = Number(list[i].quantity) || 0;
        list[i].quantity = q;
        otherSum += q;
      });

      let total = newQty + otherSum;

      if (total > maxQty && otherIdxs.length) {
        let diff = total - maxQty;
        for (let k = otherIdxs.length - 1; k >= 0 && diff > 0; k--) {
          const idxOther = otherIdxs[k];
          const canCut = Math.min(Number(list[idxOther].quantity) || 0, diff);
          if (canCut > 0) {
            list[idxOther].quantity =
              (Number(list[idxOther].quantity) || 0) - canCut;
            diff -= canCut;
          }
        }
        total =
          (Number(list[index].quantity) || 0) +
          otherIdxs.reduce((s, i) => s + (Number(list[i].quantity) || 0), 0);
      }

      if (total < maxQty) {
        const remaining = maxQty - total;

        if (otherIdxs.length) {
          const lastIdx = otherIdxs[otherIdxs.length - 1];
          list[lastIdx].quantity =
            (Number(list[lastIdx].quantity) || 0) + remaining;
        } else {
          list[index].quantity =
            (Number(list[index].quantity) || 0) + remaining;
        }
      }

      let cleaned = list.filter(
        (a) => Number(a.quantity) > 0 && a.recipientTempId
      );

      if (!cleaned.length) {
        cleaned = [
          {
            recipientTempId:
              list[index].recipientTempId || list[0]?.recipientTempId || "r1",
            quantity: maxQty,
          },
        ];
      }

      return {
        ...prev,
        [itemId]: cleaned,
      };
    });
  };

  const removeAllocationRow = (itemId: string, index: number, itemQty: number) => {
    setItemAllocations((prev) => {
      const list = [...(prev[itemId] || [])];
      list.splice(index, 1);
      return {
        ...prev,
        [itemId]: normalizeAllocations(itemQty, list, recipients[0]?.tempId),
      };
    });
  };

  /* -------------------- Payload & Checkout ----------------------- */

  const validateBeforeOrder = () => {
    if (!selectedItems.length) {
      showToast(
        langClass ? "الرجاء تحديد عناصر" : "Please select items to purchase",
        "error"
      );
      return false;
    }

    if (!senderPhone?.trim()) {
      showToast(
        langClass ? "أدخل رقم هاتف المرسل" : "Please enter sender phone",
        "error"
      );
      return false;
    }

    if (!recipients.length) {
      showToast(
        langClass
          ? "أضف مستلمًا واحدًا على الأقل"
          : "Add at least one recipient",
        "error"
      );
      return false;
    }

    for (const r of recipients) {
      if (!r.phone?.trim()) {
        showToast(
          `${r.label}: ${
            langClass
              ? "يرجى إدخال رقم الهاتف ورسالة البطاقة"
              : "please fill phone & card message"
          }`,
          "error"
        );
        return false;
      }
    }

    for (const item of selectedItems) {
      const allocs = itemAllocations[item.id] || [];
      const sum = allocs.reduce((s, a) => s + Number(a.quantity || 0), 0);
      if (!allocs.length || sum !== Number(item.qty)) {
        showToast(
          `${langClass ? "تحقق من التوزيع" : "Check allocation"} ${
            langClass ? "لـ" : "for"
          } ${langClass ? item.ar_title : item.en_title}`,
          "error"
        );
        return false;
      }
    }

    return true;
  };

  const handleOrderPayload = async () => {
    try {
      const ongoingOrder = await getOnGoingOrderByUser(id);


      if (ongoingOrder?.data?.length > 0) {
        setOrderLoading(false);
        showToast(
          langClass ? "الرجاء إكمال الطلب الحالي" : "Please complete the ongoing order",
          "error"
        );
        return;
      }

      // setOrderLoading(true);

      if (!validateBeforeOrder()) {
        setOrderLoading(false);
        return;
      }

      // const code = nextOrderCode("SA");
      const taxAmount = delivery;
      const totalAmount = round2(total());

      // 1) Order ka payload (jaisa tum pehle bana rahe thay)
      const recipientsPayload = recipients.map((r) => ({
        tempId: r.tempId,
        label: r.label,
        phone: r.phone.trim(),
        cardMessage: r.cardMessage.trim(),
        address: {
          senderPhone: String(senderPhone).trim(),
          receiverPhone: String(r.phone).trim(),
        },
      }));

      const itemsPayload = selectedItems.map((item) => ({
        product: item.productId,
        quantity: Number(item.qty || 1),
        allocations: (itemAllocations[item.id] || []).map((a) => ({
          recipientTempId: a.recipientTempId,
          quantity: Number(a.quantity || 0),
        })),
      }));

      const couponCode =
        couponMessage && (voucher || coupon?.code)
          ? String(voucher || coupon?.code)
          : undefined;

      const payload = {
        // code,
        user: id,
        senderPhone: String(senderPhone).trim(),
        recipients: recipientsPayload,
        items: itemsPayload,
        taxAmount,
        couponCode,
        grandTotal: totalAmount,
      };

      // 🔴 IMPORTANT: redirect se *pehle* order ko localStorage me save karo
      localStorage.setItem("order", JSON.stringify(payload));

      // 2) Stripe ke liye products array
      const productsForStripe = selectedItems.map((item) => ({
        productId: item.productId,
        en_name: item.en_title,
        price: item.price, // QAR
        quantity: item.qty,
        deliveryCharges: item.deliveryCharges
      }));


      // 3) Backend se checkout session banao
      const resp = await fetch(
        `${BASE_URL}/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            products: productsForStripe,
            // orderCode: code,
            userId: id,
          }),
        }
      );

      const session = await resp.json();

      if (!resp.ok) {
        showToast(
          session?.error ||
            "Failed to start Stripe Checkout. Please try again.",
          "error"
        );
        setOrderLoading(false);
        return;
      }

      // 4) NEW FLOW – URL se redirect
      if (session.url) {
        window.location.assign(session.url); // ya window.location.href = session.url;
        return;
      }

      // Agar kisi wajah se url na aaye to fallback (agar old jest stripe use ho)
      const stripe = await stripePromise;
      await (stripe as any)?.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
      console.error("Failed to create order/payment:", error);
      showToast(
        langClass
          ? "فشل إنشاء الدفع"
          : "Failed to start payment. Please try again.",
        "error"
      );
      setOrderLoading(false);
    }
  };

  const allocationsInvalid = selectedItems.some((item) => {
    const allocs = itemAllocations[item.id] || [];
    const sum = allocs.reduce((s, a) => s + Number(a.quantity || 0), 0);
    return !allocs.length || sum !== Number(item.qty);
  });

  const disableCheckout =
    orderLoading ||
    !selectedItems.length ||
    !senderPhone ||
    !recipients.length ||
    recipients.some((r) => !r.phone?.trim()) ||
    allocationsInvalid;

  const handleResetDetails = () => {
    setSenderPhone("");
    setRecipients([
      {
        tempId: "r1",
        label: "Recipient 1",
        phone: "",
        cardMessage: "",
      },
    ]);
  };

  const formatPhone = (val = "") => {
    let v = val.replace(/[^\d+]/g, "");
    return v.replace(/^(\+\d{3})(\d+)/, "$1 $2");
  };

  /* ============================= UI ============================== */

  return (
    <section id="cart" className="pt-4 pb-10">
      {/* Global Toast */}
      <ToastNotification
        open={toastState.open}
        type={toastState.type}
        title={
          toastState.type === "success"
            ? langClass
              ? "تم بنجاح"
              : "Success"
            : langClass
            ? "حدث خطأ"
            : "Error"
        }
        message={toastState.message}
        duration={3000}
        onClose={() =>
          setToastState((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />

      <div className="custom-container pb-10">
        <Link href={"/"} className="px-4">
          <div className="bg-[#0fb5bb25] p-2 inline-block rounded-full">
            {langClass ? (
              <MdArrowForwardIos
                size={24}
                className="cursor-pointer text-primary"
              />
            ) : (
              <MdOutlineArrowBackIos
                size={24}
                className="cursor-pointer text-primary"
              />
            )}
          </div>
        </Link>

        {/* Title */}
        <h1 className="text-4xl text-primary mt-4 px-4">
          {langClass ? "عربة التسوق" : "CART"}
        </h1>

        <div className="grid lg:grid-cols-2 gap-y-6 mt-10">
          {/* LEFT: Items + recipient allocation */}
          <div
            className={`bg-primary_light_mode border mx-4 px-4 text-primary_light_mode border-primary/20 rounded-2xl`}
          >
            <div className="flex items-center justify-between p-5 border-b border-primary/20">
              <h5 className="text-2xl font-semibold text-primary">
                {langClass ? "إجمالي العناصر" : "Total Items"}
              </h5>
              <div className="text-2xl font-semibold text-primary">
                {cartLoading ? "…" : items.length}
              </div>
            </div>

            <div className="py-4 pt-4 pb-2 text-black text-lg font-medium">
              {langClass
                ? "حدد العناصر التي تريد شراءها"
                : "Select Items You Want To Purchase"}
            </div>

            <div className="pt-4 pb-5 space-y-4 overflow-y-auto max-h-[900px]">
              {cartLoading && (
                <p className="text-sm text-slate-500 px-2">
                  {langClass ? "جارِ تحميل سلة التسوق…" : "Loading your cart…"}
                </p>
              )}

              {!cartLoading && items.length === 0 && (
                <p className="text-sm text-slate-500 px-2">
                  {langClass
                    ? "لا توجد عناصر في سلتك."
                    : "There are no items in your cart."}
                </p>
              )}

              {items.map((i) => {
                const allocs = itemAllocations[i.id] || [];
                return (
                  <CartItem
                    key={i.id}
                    item={i}
                    langClass={langClass}
                    toggleSelect={toggleSelect}
                    changeQty={changeQty}
                    removeItem={removeItem}
                    qtyUpdating={qtyUpdating}
                    removing={removing}
                    allocations={itemAllocations[i.id] || []}
                  />
                );
              })}
            </div>
          </div>

          {/* RIGHT: Sender + Recipients + Summary */}
          <div className="space-y-6">
            {/* Details */}
            <div
              className={`bg-primary_light_mode border mx-4 px-4 border-primary/20 rounded-2xl ${PANEL_RING}`}
            >
              <div className="flex items-center gap-2 p-5 border-b border-primary/20">
                <FiGift className="text-primary" />
                <h5 className="text-primary text-xl font-semibold">
                  {langClass ? "تفاصيل" : "Details"}
                </h5>
              </div>

              <div className="py-4 space-y-5">
                {/* Sender phone */}
                <div>
                  <span className="text-primary font-medium">
                    {langClass ? "هاتف المرسل" : "Sender Phone"}
                  </span>
                  <div className="mt-2 relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+974 0000 576"
                      value={senderPhone}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        setSenderPhone(formatted);
                      }}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                </div>

                {/* Recipients list */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-medium">
                      {langClass
                        ? "المستلمون"
                        : "Recipient (Number & Card Message)"}
                    </span>
                    {/* <button
                      type="button"
                      onClick={addRecipient}
                      className="inline-flex items-center gap-1 text-primary text-sm hover:text-primary/80"
                    >
                      <FiPlusCircle />
                      <span>{langClass ? "إضافة مستلم" : "Add Recipient"}</span>
                    </button> */}
                  </div>

                  {recipients.map((r, idx) => (
                    <div
                      key={r.tempId}
                      className="rounded-2xl border border-primary/15 bg-white/70 px-3 py-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-primary text-sm">
                          {r.label}
                        </div>
                      </div>

                      {/* phone */}
                      <div className="relative">
                        <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          placeholder="+974 0000 576"
                          value={r.phone}
                          onChange={(e) => {
                            const formatted = formatPhone(e.target.value);
                            updateRecipientField(r.tempId, "phone", formatted);
                          }}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        />
                      </div>

                      {/* card message */}
                      <textarea
                        rows={2}
                        placeholder={
                          langClass
                            ? "رسالة البطاقة لهذا المستلم"
                            : "Card message for this recipient"
                        }
                        value={r.cardMessage}
                        onChange={(e) =>
                          updateRecipientField(
                            r.tempId,
                            "cardMessage",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-primary/20 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  ))}
                </div>

                {/* Preview + Reset */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    className="px-6 py-2.5 rounded-xl border border-primary/20 text-[#333] hover:bg-primary hover:text-white font-medium transition-all duration-200"
                    onClick={handleResetDetails}
                  >
                    {langClass ? "إعادة تعيين" : "Reset"}
                  </button>
                  <button
                    onClick={() => setPreviewOpen(true)}
                    className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/70"
                  >
                    {langClass ? "معاينة" : "Preview"}
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div
              className={`bg-primary_light_mode mx-4 px-4 border-primary/20 rounded-2xl ${PANEL_RING}`}
            >
              <header className="flex items-center gap-2 p-5 border-b border-primary/20">
                <FiGift className="text-primary" />
                <h5 className="text-primary text-xl font-semibold">
                  {langClass ? "ملخص الطلب" : "Order Summary"}
                </h5>
              </header>

              <div className="py-4 space-y-5">
                <Row
                  label={langClass ? "المجموع الفرعي" : "Subtotal"}
                  value={CURRENCY(subtotal)}
                />
                <Row
                  label={langClass ? "رسوم التوصيل" : "Delivery charges"}
                  value={CURRENCY(delivery)}
                />
                <p className="text-[#333] text-sm leading-relaxed max-w-sm">
                  {langClass
                    ? ".يرجى ملاحظة أن بعض المناطق والتوصيل السريع قد يتطلبان رسوم توصيل إضافية"
                    : "Please note that specific regions and express delivery may incur extra delivery fees"}
                </p>
                <hr className="border-primary/20" />
                {couponMessage && coupon && (
                  <Row
                    label={langClass ? "خصم القسيمة" : "Coupon Discount"}
                    value={
                      coupon.type === "percentage"
                        ? `${coupon.value}%`
                        : CURRENCY(coupon.value)
                    }
                  />
                )}
                <Row
                  label={
                    <span className="font-semibold text-lg">
                      {langClass ? "المجموع" : "Total"}
                    </span>
                  }
                  value={
                    <span className="font-semibold text-lg text-primary">
                      {CURRENCY(total())}
                    </span>
                  }
                />

                <button
                  disabled={disableCheckout}
                  onClick={handleOrderPayload}
                  className={`mt-2 w-full py-3 rounded-xl text-white font-medium transition-all ${
                    disableCheckout
                      ? "bg-primary/50 opacity-50 cursor-not-allowed"
                      : "bg-primary hover:opacity-90"
                  }`}
                >
                  {!orderLoading ? (
                    <>{langClass ? "وضع النظام" : "Pay With Stripe"}</>
                  ) : (
                    <ClipLoader color="#fff" size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        senderPhone={senderPhone}
        recipients={recipients}
        items={selectedItems}
        allocations={itemAllocations}
      />
    </section>
  );
}

/* ------------------------- Helpers ------------------------- */

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-[#333]">
      <span className="font-medium">{label}</span>
      <span className="text-[#111] font-medium">{value}</span>
    </div>
  );
}

// normalize allocations so sum == itemQty & valid
function normalizeAllocations(itemQty: number | string, allocs: any[], defaultRecipientTempId: string) {
  const qty = Number(itemQty || 0);
  if (qty <= 0) return [];

  let list = (allocs || [])
    .map((a) => ({
      recipientTempId: a.recipientTempId,
      quantity: Math.max(0, Number(a.quantity || 0)),
    }))
    .filter((a) => !!a.recipientTempId);

  list = list.filter((a) => a.quantity > 0);

  let sum = list.reduce((s: number, a) => s + a.quantity, 0);

  if (!list.length || !sum) {
    if (!defaultRecipientTempId) return [];
    return [
      {
        recipientTempId: defaultRecipientTempId,
        quantity: qty,
      },
    ];
  }

  if (sum < qty) {
    const diff = qty - sum;
    list[list.length - 1].quantity += diff;
    sum = qty;
  }

  if (sum > qty) {
    let extra = sum - qty;
    for (let i = list.length - 1; i >= 0 && extra > 0; i--) {
      const canTake = Math.min(list[i].quantity - 1, extra);
      if (canTake > 0) {
        list[i].quantity -= canTake;
        extra -= canTake;
      }
      if (list[i].quantity <= 0) {
        list.splice(i, 1);
      }
    }
    if (extra > 0 && list.length) {
      list[list.length - 1].quantity = Math.max(
        1,
        list[list.length - 1].quantity - extra
      );
    }
  }

  const finalSum = list.reduce((s, a) => s + a.quantity, 0);
  if (finalSum !== qty && defaultRecipientTempId) {
    return [
      {
        recipientTempId: defaultRecipientTempId,
        quantity: qty,
      },
    ];
  }

  return list;
}
