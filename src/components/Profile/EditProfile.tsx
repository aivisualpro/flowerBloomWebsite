import React, { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import Card from "./Card";
import SectionTitle from "./SectionTitle";
import Field from "./Field";
import { useTranslation } from "react-i18next";
import { updateUser } from "../../api/user";
import { ClipLoader } from "react-spinners";
import { useSession } from "next-auth/react";

export default function EditProfile({ tab, setTab }: { tab: string; setTab: (tab: string) => void }) {
  const { i18n } = useTranslation();
  const langClass = i18n.language === "ar";
  const { update: updateSession } = useSession();

  const [loading, setLoading] = useState(false);

  const [userDetail, setUserDetail] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    phone: "",
  });

  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw)?.user || null);
    } catch {}
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        firstName: userDetail?.firstName || user?.firstName,
        lastName: userDetail?.lastName || user?.lastName,
        email: userDetail?.email || user?.email,
        dob: userDetail?.dob || user?.dob,
        phone: userDetail?.phone || user?.phone,
      };

      const response = await updateUser(payload, user._id);
      if (response?.success) {
        // 1. Get old data (so we keep the token)
        let oldData: any = { user: {} };
        try {
          const raw = localStorage.getItem("user");
          if (raw) oldData = JSON.parse(raw) || { user: {} };
        } catch {}

        // 2. Replace only the "user" part with fresh data, merging to keep all fields
        const updatedUser = response.data || {};
        const newData = {
          ...oldData,
          user: {
            ...oldData.user,
            ...updatedUser,
            _id: oldData.user._id, // keep the _id
            image: oldData.user.image || updatedUser.image || "", // preserve image
          },
        };

        // 3. Save back to localStorage
        localStorage.setItem("user", JSON.stringify(newData));

        // 4. Also update the NextAuth session so AuthProvider doesn't overwrite
        await updateSession({
          firstName: newData.user.firstName,
          lastName: newData.user.lastName,
          phone: newData.user.phone,
          dob: newData.user.dob,
        });

        // 5. Switch tab
        setTab("profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <SectionTitle>{langClass ? "تعديل المعلومات" : "Edit Info"}</SectionTitle>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Field label={`${langClass ? "الاسم :" : "First Name :"}`}>
          <input
            className="Input border-[1px] bg-[#fff] rounded-[10px] w-full border-primary/20 px-4 py-3"
            onChange={(e) =>
              setUserDetail({ ...userDetail, firstName: e.target.value })
            }
            defaultValue={user?.firstName}
          />
        </Field>
        <Field label={`${langClass ? "كلمه المرور :" : "Last Name :"}`}>
          <input
            type="name"
            className="Input border-[1px] bg-[#fff] rounded-[10px] w-full border-primary/20 px-4 py-3"
            onChange={(e) =>
              setUserDetail({ ...userDetail, lastName: e.target.value })
            }
            defaultValue={user?.lastName}
          />
        </Field>
        <Field label={`${langClass ? "البريد الالكتروني :" : "Email :"}`}>
          <input
            className="Input border-[1px] bg-[#fff] rounded-[10px] w-full border-primary/20 px-4 py-3"
            onChange={(e) =>
              setUserDetail({ ...userDetail, email: e.target.value })
            }
            defaultValue={user?.email}
          />
        </Field>
        <Field label={`${langClass ? "تاريخ الميلاد :" : "Date Of Birth :"}`}>
          <input
            type="date"
            className="Input border-[1px] bg-[#fff] rounded-[10px] w-full border-primary/20 px-4 py-3"
            onChange={(e) =>
              setUserDetail({ ...userDetail, dob: e.target.value })
            }
            defaultValue={user?.dob || ""}
          />
        </Field>
        <Field label={`${langClass ? "رقم الهاتف :" : "Phone Number :"}`}>
          <input
            className="Input border-[1px] bg-[#fff] rounded-[10px] w-full border-primary/20 px-4 py-3"
            onChange={(e) =>
              setUserDetail({ ...userDetail, phone: e.target.value })
            }
            defaultValue={user?.phone}
          />
        </Field>
      </div>

      <div className="mt-6 flex items-center justify-end gap-4">
        <button
          onClick={() => setTab("profile")}
          className="rounded-lg text-sm bg-primary_light_mode hover:bg-primary_light_mode/10 px-4 py-2 font-semibold text-primary shadow"
        >
          {langClass ? "الغاء" : "Cancel"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`${
            loading ? "opacity-50" : "opacity-100"
          } rounded-lg text-sm bg-primary px-4 py-2 font-semibold text-white shadow hover:bg-primary/80`}
        >
          {loading ? (
            <ClipLoader size={18} color="#fff" />
          ) : (
            <span>{langClass ? "تحديث" : "Update"}</span>
          )}
        </button>
      </div>
    </Card>
  );
}
