"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";

/**
 * Syncs the NextAuth session into localStorage so that all existing
 * components (Navbar, Cart, ProtectedRoute, etc.) continue to work
 * without modification via `localStorage.getItem("user")`.
 *
 * IMPORTANT: This merges with existing localStorage data so that fields
 * updated by the dashboard API (dob, phone, etc.) are preserved even
 * when they're not in the NextAuth JWT.
 */
function SessionSync({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      const u = session.user as any;

      // Read existing localStorage to preserve fields not in JWT
      let existing: any = {};
      try {
        const raw = localStorage.getItem("user");
        if (raw) existing = JSON.parse(raw)?.user || {};
      } catch {}

      const merged = {
        _id: u.id || existing._id,
        firstName: u.firstName || u.name?.split(" ")[0] || existing.firstName || "",
        lastName: u.lastName || u.name?.split(" ").slice(1).join(" ") || existing.lastName || "",
        email: u.email || existing.email,
        phone: u.phone || existing.phone || "",
        dob: u.dob || existing.dob || "",
        role: u.role || existing.role || "CUSTOMER",
        image: u.image || existing.image || "",
        provider: u.provider || existing.provider || "credentials",
      };

      localStorage.setItem(
        "user",
        JSON.stringify({
          token: u.legacyToken || existing.token || "",
          user: merged,
        })
      );
    } else {
      localStorage.removeItem("user");
    }
  }, [session, status]);

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync>{children}</SessionSync>
    </SessionProvider>
  );
}
