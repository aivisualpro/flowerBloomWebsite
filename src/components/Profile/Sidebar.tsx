import React, { useState } from "react";
import { FiUser, FiLogOut, FiHeart } from "react-icons/fi";
import SideItem from "./SideItem";
import { CiDeliveryTruck } from "react-icons/ci";
import { GrTransaction } from "react-icons/gr";
import { useTranslation } from "react-i18next";
import { signOut } from "next-auth/react";

export default function Sidebar({ tab, setTab }: { tab: string, setTab: any }) {
  const { i18n } = useTranslation();
  const langClass = i18n.language === "ar";

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    localStorage.removeItem("user");
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <aside className="rounded-2xl border border-primary/30 bg-white p-4 shadow-sm">
      <nav className="space-y-3">
        <SideItem
          active={tab === "profile"}
          onClick={() => setTab("profile")}
          icon={<FiUser />}
          label={`${langClass ? "حساب تعريفي" : "Profile"}`}
        />
        <SideItem
          active={tab === "orders"}
          onClick={() => setTab("orders")}
          icon={<CiDeliveryTruck />}
          label={`${langClass ? "طلباتي" : "My Orders"}`}
        />
        <SideItem
          active={tab === "transactions"}
          onClick={() => setTab("transactions")}
          icon={<GrTransaction />}
          label={`${langClass ? "معاملاتي" : "Transactions"}`}
        />
        <SideItem
          active={tab === "wishlist"}
          onClick={() => setTab("wishlist")}
          icon={<FiHeart />}
          label={`${langClass ? "المفضلة" : "Favorites"}`}
        />
      </nav>

      <button
        onClick={handleLogout}
        disabled={loading}
        className={`${loading ? "opacity-50" : "opacity-100"} mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-4 py-3 font-semibold text-white shadow-[0_8px_20px_rgba(239,68,68,0.3)]`}
      >
        <FiLogOut className="h-4 w-4" />{" "}
        {langClass ? "تسجيل الخروج" : "Log out"}
      </button>
    </aside>
  );
}
