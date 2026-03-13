
import React from 'react';
import { FiGift, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const CURRENCY = (n: number | string) => `QAR ${Number(n || 0).toLocaleString()}`;
const PANEL_RING = "ring-1 ring-primary/10";

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  senderPhone: string;
  recipients: any[];
  items: any[];
  allocations: { [key: string]: any[] };
}

export default function PreviewModal({
  open,
  onClose,
  senderPhone,
  recipients,
  items,
  allocations,
}: PreviewModalProps) {
  const { i18n } = useTranslation();
  const langClass = i18n.language === "ar"; // or logic passing props if preferred

  if (!open) return null;

  const getRecipientLabel = (tempId: string) =>
    recipients.find((r) => r.tempId === tempId)?.label || tempId;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 mx-auto w-[900px] max-w-[90vw] max-height-[90vh] overflow-y-auto">
        <div
          className={`bg-white border border-primary/20 rounded-3xl shadow-2xl ${PANEL_RING}`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-primary/20 bg-primary/5 rounded-t-3xl">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FiGift />
              </span>
              <h3 className="text-primary text-xl">
                {langClass ? "معاينة الطلب" : "Order Preview"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 grid place-items-center rounded-full border border-primary/20 text-slate-600 hover:bg-primary/10"
            >
              <FiX />
            </button>
          </div>

          <div className="p-6 space-y-5 h-[500px] 2xl:h-[800px] overflow-y-scroll">
            <div className="text-primary font-medium">
              {langClass ? "هاتف المرسل:" : "Sender Phone:"}{" "}
              <span className="text-slate-800">{senderPhone || "—"}</span>
            </div>

            {/* Recipients */}
            <div className="space-y-3">
              {recipients.map((r) => (
                <div
                  key={r.tempId}
                  className="border border-primary/15 rounded-2xl px-3 py-2 bg-primary/5"
                >
                  <div className="font-semibold text-primary text-sm">
                    {r.label}
                  </div>
                  <div className="text-xs text-slate-700">
                    {langClass ? "هاتف:" : "Phone:"} {r.phone || "—"}
                  </div>
                  <div className="text-xs text-slate-700 mt-1">
                    {langClass ? "رسالة البطاقة:" : "Card Message:"}{" "}
                    {r.cardMessage || "—"}
                  </div>
                </div>
              ))}
            </div>

            {/* Card image + message example */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-primary font-medium text-sm">
                  {langClass ? "بطاقة نموذجية" : "Sample Card"}
                </span>
                <div className="mt-2 relative rounded-2xl overflow-hidden ring-1 ring-primary/20">
                  <img
                    src="/images/preview-card.png"
                    alt="card"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] text-center">
                     <p className="text-[#8B5E3C] text-sm md:text-base font-semibold leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
                       {recipients[0]?.cardMessage || "Your message..."}
                     </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <p>
                  {langClass
                    ? "سيتم تطبيق رسائل البطاقة لكل مستلم كما هو مذكور أعلاه."
                    : "Card messages will be printed per recipient as specified above."}
                </p>
              </div>
            </div>

            {/* Items with allocations */}
            <div className="space-y-2">
              <div className="text-primary font-medium">
                {langClass ? "العناصر:" : "Items & Recipient Splits:"}
              </div>
              {items.map((i) => {
                const allocs = allocations[i.id] || [];
                return (
                  <div
                    key={i.id}
                    className="border border-primary/15 rounded-2xl px-3 py-2 flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={i.image}
                        alt={langClass ? i.ar_title : i.en_title}
                        className="h-12 w-16 rounded-xl object-cover ring-1 ring-primary/20"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-800">
                          {langClass ? i.ar_title : i.en_title}
                        </div>
                        <div className="text-[10px] text-primary">
                          {CURRENCY(i.price)} × {i.qty}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 text-[10px] text-slate-700 space-y-1">
                      {allocs.map((a, idx) => (
                        <div key={idx}>
                          {getRecipientLabel(a.recipientTempId)} → {a.quantity}
                        </div>
                      ))}
                      {!allocs.length && (
                        <div className="text-rose-500">
                          {langClass
                            ? "لم يتم تعيين (سيتم استخدام الافتراضي)"
                            : "No allocation set (will use default)"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
