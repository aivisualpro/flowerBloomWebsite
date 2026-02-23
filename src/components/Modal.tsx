// src/components/orders/Modal.jsx
import React from "react";
import { Dialog } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

const PRIMARY = "#0FB4BB";
const BORDER = "#BFE8E7";

interface ModalProps {
  itemsOpen: boolean;
  closeItems: () => void;
  activeOrder: any;
  isAr: boolean;
}

export default function Modal({ itemsOpen, closeItems, activeOrder, isAr }: ModalProps) {
  const matches = useMediaQuery("(max-width:767px)");

  if (!activeOrder) return null;

  const currency = "QAR";
  const items = Array.isArray(activeOrder.items) ? activeOrder.items : [];
  const recipients = Array.isArray(activeOrder.recipients)
    ? activeOrder.recipients
    : [];

  // quick helpers
  const t = (en: string, ar: string) => (isAr ? ar : en);

  const rById = new Map(
    recipients.map((r: any, i: number) => [
      r?._id,
      {
        label: r?.label || t(`Recipient ${i + 1}`, `وصول کنندہ ${i + 1}`),
        phone: r?.phone || "",
      },
    ])
  );

  const receiverLines = recipients.map((r: any, i: number) => {
    const label = r?.label || t(`Recipient ${i + 1}`, `وصول کنندہ ${i + 1}`);
    const phone = r?.phone || "";
    return `${label} — ${phone}`;
  });

  const formatMoney = (n: any) =>
    `${currency} ${Number(n || 0).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;

  // derive coupon discount if basic value/type present
  const couponValue = activeOrder?.coupon ?? 0;
  const couponType = (activeOrder?.couponType || "").toLowerCase(); // 'flat' | 'percentage'
  let couponDiscount = 0;
  if (couponType === "flat") couponDiscount = Number(couponValue || 0);
  if (couponType === "percentage") {
    // simple percentage off subtotal of items
    const subtotal = items.reduce(
      (s: number, it: any) => s + Number(it.price || 0) * Number(it.qty || 0),
      0
    );
    couponDiscount = Math.round((subtotal * Number(couponValue || 0)) / 100);
  }

  const deliveryCharges = Number(activeOrder?.taxAmount || 0);
  const total = Number(activeOrder?.grandTotal || 0);
  const senderPhone = activeOrder?.sender || "";

  return (
    <Dialog
      open={itemsOpen}
      onClose={closeItems}
      fullWidth
      maxWidth="sm"
      dir={isAr ? "rtl" : "ltr"}
      PaperProps={{
        sx: {
          borderRadius: 8,
          padding: matches ? 0 : 3,
          border: `${matches ? 0 : 1}px solid ${BORDER}`,
          overflow: "visible",
          background: "Transparent",
        },
      }}
    >
      <div
        className="max-h-[70vh] overflow-y-scroll modal_box p-4"
        style={{ background: "#fff", borderRadius: 32 }}
      >
        {/* Title */}
        <h2 className="text-center text-2xl font-extrabold tracking-wider text-[#14a3a7]">
          {t("FLOWER BLOOM", "فلاور بلوم")}
        </h2>

        {/* Sender / Receiver */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="font-semibold text-[#14a3a7]">
              {t("Sender Number", "مرسل نمبر")}
            </div>
            <div className="mt-1 text-slate-700">{senderPhone || "-"}</div>
          </div>

          <div>
            <div className="font-semibold text-[#14a3a7]">
              {t("Receiver Number", "موصول کنندہ نمبر")}
            </div>
            <div className="mt-1 text-slate-700 leading-6">
              {receiverLines.length ? (
                receiverLines.map((line: string, idx: number) => <div key={idx}>{line}</div>)
              ) : (
                <div>-</div>
              )}
            </div>
          </div>
        </div>

        {/* Table header */}
        <div className="mt-6 border-t pt-4">
          <div className="grid grid-cols-12 text-[#14a3a7] font-semibold">
            <div className="col-span-2">{t("S.no", "نمبر")}</div>
            <div className="col-span-7">{t("Item", "آئٹم")}</div>
            <div className="col-span-3 text-right">
              {t("Item Price", "قیمت")}
            </div>
          </div>
          <div className="mt-2 h-px bg-slate-200" />
        </div>

        {/* Items */}
        <div className="divide-y">
          {items.map((it: any, idx: number) => {
            const unit = Number(it.price || 0);
            const qty = Number(it.qty || 0);
            const lineTotal = unit * qty;

            // allocations → [{id,label,short,phone,qty}]
            const allocations = (
              Array.isArray(it.allocations) ? it.allocations : []
            )
              .map((a: any) => {
                const r: any = rById.get(a?.recipientID) || {};
                const q = Number(a?.quantity || 0);
                const label =
                  activeOrder.recipients.find((r: any) => r._id === a.recipientId)
                    ?.label || `Recipient`;
                const phone = r.phone || "";
                // Short tag like R1, R2 … (derive from label's last digit if present)
                const short = /(\d+)$/.test(label)
                  ? `R${label.match(/(\d+)$/)[1]}`
                  : label.split(" ")[0] || "R";
                return { id: a?.recipientID, label, phone, short, qty: q };
              })
              // sort: highest quantity first
              .sort((a: any, b: any) => b.qty - a.qty);

            return (
              <div key={idx} className="grid grid-cols-12 py-3 items-center">
                <div className="col-span-2 text-slate-600">
                  {String(idx + 1).padStart(2, "0")}
                </div>

                <div className="col-span-7">
                  <div className="flex items-center gap-3">
                    {it.image ? (
                      <img
                        src={it.image}
                        alt={it.en_name || it.ar_name || "item"}
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-slate-200" />
                    )}

                    <div className="min-w-0">
                      <div className="text-slate-800 truncate">
                        {isAr
                          ? it.ar_name || it.en_name
                          : it.en_name || it.ar_name}
                      </div>

                      {/* Qty + highlighted allocations */}
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-slate-900/80 px-2 py-0.5 text-[11px] font-semibold text-white">
                          ×{qty}
                        </span>

                        {/* Allocation chips: R1 • 6, R2 • 1 */}
                        {allocations.map((al: any, i: number) => (
                          <span
                            key={`${al.id || i}`}
                            title={`${al.label}${
                              al.phone ? " — " + al.phone : ""
                            }`}
                            className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
                          >
                            <span className="opacity-90">{al.short}</span>
                            <span className="mx-1 opacity-60">•</span>
                            <span className="rounded-sm bg-emerald-600/90 px-1 text-[11px] text-white">
                              {al.qty}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-3 text-right text-slate-800">
                  {formatMoney(lineTotal)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary rows */}
        <div className="mt-4 border-t pt-4 space-y-2">
          <div className="grid grid-cols-12 items-center">
            <div className="col-span-9 font-semibold text-[#14a3a7]">
              {t("Delivery Charges", "ڈیلیوری چارجز")}
            </div>
            <div className="col-span-3 text-right">
              {formatMoney(deliveryCharges)}
            </div>
          </div>

          {/* {couponDiscount ? (
            <div className="grid grid-cols-12 items-center">
              <div className="col-span-9 font-semibold text-[#14a3a7]">
                {t("Coupon Discount", "کپون ڈسکاؤنٹ")}
              </div>
              <div className="col-span-3 text-right">
                -{formatMoney(couponDiscount)}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12 items-center">
              <div className="col-span-9 font-semibold text-[#14a3a7]">
                {t("Coupon Discount", "کپون ڈسکاؤنٹ")}
              </div>
              <div className="col-span-3 text-right">{formatMoney(0)}</div>
            </div>
          )} */}

          <div className="grid grid-cols-12 items-center pt-2">
            <div className="col-span-9 font-bold text-slate-800">
              {t("Total", "کل")}
            </div>
            <div className="col-span-3 text-right font-bold text-slate-900">
              {formatMoney(total)}
            </div>
          </div>
        </div>

        {/* Close */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={closeItems}
            className="rounded-xl bg-[#14a3a7] px-6 py-2 font-semibold text-white hover:opacity-90"
          >
            {t("Close", "بند کریں")}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
