import React from "react";
import { FiEdit2 } from "react-icons/fi";
import Card from "./Card";
import SectionTitle from "./SectionTitle";
import Field from "./Field";
import { useTranslation } from "react-i18next";

export default function ProfilePanel({ tab, setTab }: { tab: string; setTab: (tab: string) => void }) {
  const { i18n } = useTranslation();
  const langClass = i18n.language === "ar";

  const [user, setUser] = React.useState<any>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw)?.user || null);
    } catch {}
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  const initials = [user.firstName?.[0], user.lastName?.[0]]
    .filter(Boolean)
    .map((c: string) => c.toUpperCase())
    .join("");

  return (
    <Card>
      <SectionTitle
        action={
          <button
            onClick={() => setTab("edit")}
            className="inline-flex items-center gap-2 rounded-full bg-primary p-2 hover:bg-primary/70"
          >
            <FiEdit2 className="h-4 w-4 text-white" />
          </button>
        }
      >
        {langClass ? "معلومات شخصية" : "Personal Info"}
      </SectionTitle>

      {/* User Avatar + Name */}
      <div className="mt-6 mb-6 flex items-center gap-4">
        {user.image ? (
          <img
            src={user.image}
            alt={user.firstName || "User"}
            className="w-16 h-16 rounded-full object-cover border-2 border-primary/30 shadow-sm"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
            <span className="text-primary font-bold text-xl">{initials || "U"}</span>
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-sm text-gray-500">{user.email}</p>
          {user.provider === "google" && (
            <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
              <svg width="12" height="12" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google Account
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Field label={langClass ? "الاسم :" : "First Name :"}>
          <input
            disabled
            className="Input border-[1px] bg-[#fff] rounded-[10px] w-full border-primary/20 px-4 py-3"
            defaultValue={user.firstName}
          />
        </Field>
        <Field label={langClass ? "كلمه المرور :" : "Last Name :"}>
          <input
            disabled
            type="name"
            className="Input border-[1px] bg-[#fff] rounded-[10px] w-full border-primary/20 px-4 py-3"
            defaultValue={user.lastName}
          />
        </Field>
        <Field label={langClass ? "البريد الالكتروني :" : "Email :"}>
          <input
            disabled
            className="Input border-[1px] bg-[#fff] rounded-[10px] w-full border-primary/20 px-4 py-3"
            defaultValue={user.email}
          />
        </Field>
        <Field label={langClass ? "تاريخ الميلاد :" : "Date Of Birth :"}>
          <input
            disabled
            className="Input border-[1px] bg-[#fff] rounded-[10px] w-full border-primary/20 px-4 py-3"
            defaultValue={user.dob || ""}
          />
        </Field>
        <Field label={langClass ? "رقم الهاتف :" : "Phone Number :"}>
          <input
            disabled
            className="Input border-[1px] bg-[#fff] rounded-[10px] w-full border-primary/20 px-4 py-3"
            defaultValue={user.phone}
          />
        </Field>
      </div>
    </Card>
  );
}
