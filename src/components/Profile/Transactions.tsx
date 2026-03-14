// client/src/components/Dashboard/PaymentsTable.jsx
import React, { useMemo, useEffect, useState } from "react";
import Card from "./Card";

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { ClipLoader } from "react-spinners";

import { usePaymentsByUser } from "../../hooks/payments/usePayment";
import { getStripeSessionDetails } from "../../api/payments";

const PRIMARY = "#0FB4BB";
const BORDER = "#BFE8E7";

const pad2 = (n: number | string) => String(n).padStart(2, "0");

const fmtDateTime = (d: Date | string | null | undefined) => {
  if (!d) return "-";
  const dt = d instanceof Date ? d : new Date(d);
  const dd = pad2(dt.getDate());
  const mm = pad2(dt.getMonth() + 1);
  const yy = dt.getFullYear();
  const hh = pad2(dt.getHours());
  const min = pad2(dt.getMinutes());
  return `${dd}-${mm}-${yy} ${hh}:${min}`;
};

const fmtAmount = (value: number | null | undefined, currency = "QAR") => {
  if (value == null) return "-";
  return `${currency.toUpperCase()} ${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

interface StripeInfo {
  amountTotal?: number;
  currency?: string;
  paymentStatus?: string;
  stripeEmail?: string | null;
  paymentMethod?: string;
  paidAt?: Date | null;
}

interface PaymentRow {
  _id: string;
  sessionId: string;
  createdAt: Date | string;
  name: string;
  email: string;
  phone: string;
  amount?: number;
  currency: string;
  paymentStatus: string;
  paymentMethod: string;
}

export default function Transactions() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw) || null);
    } catch {}
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const badgeBase = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2px 10px",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
  };

  const getStatusBadgeStyle = (status: string) => {
    const s = (status || "").toLowerCase();

    if (s === "paid" || s === "succeeded") {
      return {
        ...badgeBase,
        color: "rgba(22,163,74,1)", // green text
        background: "rgba(22,163,74,0.12)",
        border: "1px solid rgba(22,163,74,0.35)",
      };
    }

    if (s === "processing" || s === "requires_payment_method") {
      return {
        ...badgeBase,
        color: "rgba(234,179,8,1)", // yellow text
        background: "rgba(234,179,8,0.12)",
        border: "1px solid rgba(234,179,8,0.35)",
      };
    }

    if (s === "failed" || s === "canceled" || s === "requires_action") {
      return {
        ...badgeBase,
        color: "rgba(220,38,38,1)", // red text
        background: "rgba(220,38,38,0.12)",
        border: "1px solid rgba(220,38,38,0.35)",
      };
    }

    // default / unknown
    return {
      ...badgeBase,
      color: "rgba(55,65,81,1)",
      background: "rgba(148,163,184,0.12)",
      border: "1px solid rgba(148,163,184,0.35)",
    };
  };

  const getMethodBadgeStyle = (method: string) => {
    const m = (method || "").toLowerCase();

    if (m.includes("card")) {
      return {
        ...badgeBase,
        color: "rgba(59,130,246,1)", // blue
        background: "rgba(59,130,246,0.12)",
        border: "1px solid rgba(59,130,246,0.35)",
      };
    }

    if (m.includes("wallet")) {
      return {
        ...badgeBase,
        color: "rgba(236,72,153,1)", // pink
        background: "rgba(236,72,153,0.12)",
        border: "1px solid rgba(236,72,153,0.35)",
      };
    }

    if (m.includes("bank") || m.includes("Transfer")) {
      return {
        ...badgeBase,
        color: "rgba(14,116,144,1)", // teal
        background: "rgba(45,212,191,0.12)",
        border: "1px solid rgba(45,212,191,0.35)",
      };
    }

    // default
    return {
      ...badgeBase,
      color: "rgba(107,114,128,1)",
      background: "rgba(209,213,219,0.3)",
      border: "1px solid rgba(209,213,219,0.6)",
    };
  };

  // payments from your own DB
  const { data, isLoading, isFetching, error } = usePaymentsByUser(
    user?.user?._id
  );

  const payments = data?.rows || [];

  // Stripe details map: { [sessionId]: { amountTotal, currency, paymentStatus, stripeEmail, paymentMethod, paidAt } }
  const [stripeDetails, setStripeDetails] = useState<Record<string, StripeInfo>>({});
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // ------------ Fetch Stripe session details for all rows ------------
  useEffect(() => {
    const fetchStripeDetails = async () => {
      if (!payments.length) return;

      setStripeLoading(true);
      setStripeError(null);

      try {
        const entries = await Promise.all(
          payments
            .filter((p: Record<string, unknown>) => p.sessionId)
            .map(async (p: Record<string, unknown>) => {
              try {
                const res = await getStripeSessionDetails(p.sessionId as string);

                if (!res?.success || !res.session) return null;

                const s = res.session;
                const pi = s.payment_intent; // expanded in backend

                const amountTotal = (s.amount_total ?? pi?.amount ?? 0) / 100; // cents -> QAR
                const currency = (
                  s.currency ??
                  pi?.currency ??
                  "qar"
                ).toUpperCase();
                const paymentStatus = s.payment_status ?? pi?.status ?? "-";

                const stripeEmail =
                  s.customer_details?.email ?? pi?.receipt_email ?? null;

                const paymentMethod =
                  (
                    pi?.payment_method_types ||
                    s.payment_method_types ||
                    []
                  ).join(", ") || "card";

                const ts = pi?.created ?? s.created; // unix seconds
                const paidAt = ts ? new Date(ts * 1000) : null;

                return {
                  sessionId: p.sessionId as string,
                  data: {
                    amountTotal,
                    currency,
                    paymentStatus,
                    stripeEmail,
                    paymentMethod,
                    paidAt,
                  },
                };
              } catch (err) {
                console.error(
                  "Stripe session fetch failed for",
                  p.sessionId,
                  err
                );
                return null;
              }
            })
        );

        const map: Record<string, StripeInfo> = {};
        for (const entry of entries) {
          if (!entry) continue;
          map[entry.sessionId] = entry.data;
        }
        setStripeDetails(map);
      } catch (err) {
        console.error("Failed to fetch Stripe details:", err);
        setStripeError("Failed to sync Stripe data");
      } finally {
        setStripeLoading(false);
      }
    };

    fetchStripeDetails();
  }, [payments]);

  // ------------ Build rows for table ------------
  const rows = useMemo((): PaymentRow[] => {
    return payments.map((p: Record<string, unknown>) => {
      const u = (p.userId || {}) as Record<string, unknown>;
      const stripeInfo = stripeDetails[(p.sessionId as string)] || {};

      return {
        _id: (p.id || p._id) as string,
        sessionId: p.sessionId as string,
        // prefer Stripe paidAt, fallback DB createdAt
        createdAt: stripeInfo.paidAt || (p.createdAt as Date | string),
        name: [u.firstName, u.lastName].filter(Boolean).join(" ") || "-",
        // prefer Stripe email, fallback app user email
        email: stripeInfo.stripeEmail || (u.email as string) || "-",
        phone: (u.phone as string) || "-",
        amount: stripeInfo.amountTotal,
        currency: stripeInfo.currency || "QAR",
        paymentStatus: stripeInfo.paymentStatus || "-",
        paymentMethod: stripeInfo.paymentMethod || "-",
      };
    });
  }, [payments, stripeDetails]);

  // ----- Loading / error states -----
  if (isLoading) {
    return (
      <Card className="h-[14rem]">
        <div className="p-4 flex items-center justify-center gap-2">
          <ClipLoader />
          <span className="text-sm text-slate-600">Loading payments…</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-[14rem]">
        <div className="p-4 text-slate-700 text-center">No Record Found</div>
      </Card>
    );
  }

  return (
    <Card className="h-[14rem]">
      <div className="previous_order_table">
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: "18px",
            overflow: "auto !important",
            bgcolor: "transparent",
            maxHeight: "200px",
          }}
        >
          <Box sx={{ px: { xs: 1, sm: 2 }, pt: 2 }}>
            <Table
              sx={{
                minWidth: 1200,
                "& th": {
                  color: PRIMARY,
                  fontWeight: 600,
                  borderBottom: `1px solid ${BORDER}`,
                  whiteSpace: "nowrap",
                },
                "& td": { borderBottom: `1px solid ${BORDER}` },
              }}
              aria-label="payments table"
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: "1rem", width: 80 }}>
                    S.No
                  </TableCell>
                  <TableCell sx={{ fontSize: "1rem", fontWeight: 400 }}>
                    Customer
                  </TableCell>
                  <TableCell sx={{ fontSize: "1rem", fontWeight: 400 }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ fontSize: "1rem", fontWeight: 400 }}>
                    Phone
                  </TableCell>
                  <TableCell sx={{ fontSize: "1rem", fontWeight: 400 }}>
                    Amount
                  </TableCell>
                  <TableCell sx={{ fontSize: "1rem", fontWeight: 400 }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontSize: "1rem", fontWeight: 400 }}>
                    Payment Method
                  </TableCell>
                  <TableCell sx={{ fontSize: "1rem", fontWeight: 400 }}>
                    Paid At
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow key={row._id || idx}>
                    <TableCell
                      sx={{
                        color: PRIMARY,
                        fontSize: "1rem",
                        fontWeight: 600,
                      }}
                    >
                      {pad2(idx + 1)}
                    </TableCell>

                    <TableCell
                      sx={{
                        color: "#4B5563",
                        fontSize: "1rem",
                        fontWeight: 400,
                      }}
                    >
                      {row.name}
                    </TableCell>

                    <TableCell
                      sx={{
                        color: "#4B5563",
                        fontSize: "1rem",
                        fontWeight: 400,
                      }}
                    >
                      {row.email}
                    </TableCell>

                    <TableCell
                      sx={{
                        color: "#4B5563",
                        fontSize: "1rem",
                        fontWeight: 400,
                      }}
                    >
                      {row.phone}
                    </TableCell>

                    <TableCell
                      sx={{
                        color: "#4B5563",
                        fontSize: "1rem",
                        fontWeight: 400,
                      }}
                    >
                      {fmtAmount(row.amount, row.currency)}
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: "1rem",
                        fontWeight: 400,
                      }}
                    >
                      <span style={getStatusBadgeStyle(row.paymentStatus)}>
                        {row.paymentStatus || "-"}
                      </span>
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: "1rem",
                        fontWeight: 400,
                      }}
                    >
                      <span style={getMethodBadgeStyle(row.paymentMethod)}>
                        {row.paymentMethod || "-"}
                      </span>
                    </TableCell>

                    <TableCell
                      sx={{
                        color: "#4B5563",
                        fontSize: "1rem",
                        fontWeight: 400,
                      }}
                    >
                      {fmtDateTime(row.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {isFetching && (
              <div className="px-2 pb-2 text-xs text-slate-500">updating…</div>
            )}

            {stripeLoading && (
              <div className="px-2 pb-2 text-xs text-slate-500">
                syncing Stripe data…
              </div>
            )}

            {stripeError && (
              <div className="px-2 pb-2 text-xs text-red-500">
                {stripeError}
              </div>
            )}
          </Box>
        </TableContainer>
      </div>
    </Card>
  );
}
