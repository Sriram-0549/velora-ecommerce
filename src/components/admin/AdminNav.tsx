"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface AdminNavProps {
  activeTab?: "products" | "orders";
  orderCount?: number;
  productCount?: number;
}

export default function AdminNav({
  activeTab,
  orderCount,
  productCount,
}: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const currentTab =
    activeTab ||
    (pathname?.startsWith("/admin/orders") ? "orders" : "products");

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      window.location.href = "/admin/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand / Breadcrumbs */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink min-w-0">
            <Link
              href="/"
              className="flex items-center gap-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-colors shrink-0"
              title="Return to Storefront"
            >
              <svg
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="hidden sm:inline">Storefront</span>
            </Link>

            <span className="text-slate-300 hidden sm:inline">/</span>

            <span className="text-[11px] sm:text-xs font-black tracking-wider sm:tracking-widest uppercase text-[#111827] truncate">
              Admin
            </span>

            <span className="hidden sm:inline rounded-full bg-blue-100 border border-blue-200 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
              Demo
            </span>
          </div>

          {/* Center/Right: Admin Navigation Tabs & Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <Link
                href="/admin/products"
                className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all ${
                  currentTab === "products"
                    ? "bg-white text-[#111827] shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-blue-600"
                }`}
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span>Products</span>
                {typeof productCount === "number" && (
                  <span className="hidden sm:inline rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-mono font-bold text-slate-700">
                    {productCount}
                  </span>
                )}
              </Link>

              <Link
                href="/admin/orders"
                className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all ${
                  currentTab === "orders"
                    ? "bg-white text-[#111827] shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-blue-600"
                }`}
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                <span>Orders</span>
                {typeof orderCount === "number" && (
                  <span className="hidden sm:inline rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-mono font-bold text-slate-700">
                    {orderCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Logout Action */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Sign out of admin"
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-red-600 shadow-2xs hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">{isLoggingOut ? "..." : "Logout"}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

