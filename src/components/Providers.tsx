'use client';

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/config/queryClient";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/components/AuthProvider";
import { ReactNode } from "react";
import "@/i18n";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          {children}
        </CartProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
