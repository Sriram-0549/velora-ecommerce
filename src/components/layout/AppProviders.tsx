"use client";

import React from "react";
import { CartProvider, useCart } from "@/context/CartContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/modules/CartDrawer";

function ToastBanner() {
  const { toastMessage } = useCart();
  if (!toastMessage) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-[#111827] px-5 py-3.5 text-xs font-semibold text-white shadow-2xl border border-slate-800">
      <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
      <span>{toastMessage}</span>
    </div>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <ToastBanner />
    </CartProvider>
  );
}
