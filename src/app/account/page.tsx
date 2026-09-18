"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";

export default function AccountPage() {
  const [activeAuthTab, setActiveAuthTab] = useState<"signin" | "register">("signin");
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Form states for demo customer auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Order lookup state
  const [lookupOrderId, setLookupOrderId] = useState("");
  const [lookupResult, setLookupResult] = useState<Order | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Saved order in localStorage
  const [savedOrder, setSavedOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("velora_latest_order");
      if (stored) {
        setSavedOrder(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setAuthSuccessMsg(`Welcome back to VELORA, ${email.split("@")[0]}! Customer portal active.`);
    setTimeout(() => setAuthSuccessMsg(null), 5000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    setAuthSuccessMsg(`Account created for ${name}! Welcome to the VELORA membership.`);
    setTimeout(() => setAuthSuccessMsg(null), 5000);
  };

  const handleOrderLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setLookupResult(null);

    const query = lookupOrderId.trim();
    if (!query) {
      setLookupError("Please enter an order ID or reference number.");
      return;
    }

    // Check localStorage first
    if (savedOrder && savedOrder.id.toLowerCase().includes(query.toLowerCase())) {
      setLookupResult(savedOrder);
      return;
    }

    // Otherwise generate realistic simulated lookup response matching VELORA orders
    if (query.toUpperCase().startsWith("VEL-") || query.length >= 6) {
      setLookupResult({
        id: query.toUpperCase().startsWith("VEL-") ? query.toUpperCase() : `VEL-${query.slice(0, 6)}`,
        customer: {
          name: "Verified Customer",
          email: "customer@example.com",
          phone: "+91 98765 43210",
          address: "124 Horizon Avenue, Apt 4B",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
        },
        items: [
          {
            product: {
              id: "1",
              name: "Classic Oversized T-Shirt",
              description: "Premium cotton oversized t-shirt",
              price: 999,
              currency: "INR",
              category: "Men",
              image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
              imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
              rating: 4.5,
              reviewCount: 28,
              stock: 25,
              inStock: true,
            },
            quantity: 1,
          },
        ],
        subtotal: 999,
        deliveryCharge: 0,
        discount: 0,
        total: 999,
        paymentMethod: "cod",
        placedAt: new Date().toISOString(),
        estimatedDelivery: "3-5 Business Days",
      });
    } else {
      setLookupError(`No order found matching "${query}". Please check the ID and try again.`);
    }
  };

  const activeDisplayOrder = lookupResult || savedOrder;

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-24">
      {/* Header Banner */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <nav className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#111827]">My Account</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                  Client Concierge
                </span>
                <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                  Guest Shopper
                </span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#111827]">
                Customer Account
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-xl">
                Track client orders, manage delivery preferences, and access member-only concierge services.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Link
                href="/products"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-blue-700 transition-colors text-center"
              >
                Browse Collection
              </Link>
              <Link
                href="/cart"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors text-center"
              >
                View Bag
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Success Banner */}
        {authSuccessMsg && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 shadow-sm animate-fadeIn flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>{authSuccessMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5 Cols): Customer Auth / Membership Portal */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-8 shadow-xs">
              {/* Profile Avatar Header */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF] text-blue-600 border border-blue-100 shadow-xs">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.75"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-black text-[#111827]">Member Access</h2>
                  <p className="text-xs text-slate-500">
                    Sign in to sync your bag, track delivery status, and access private capsule drops.
                  </p>
                </div>
              </div>

              {/* Tabs: Sign In / Create Account */}
              <div className="mt-6 flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setActiveAuthTab("signin")}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    activeAuthTab === "signin"
                      ? "bg-white text-[#111827] shadow-xs"
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAuthTab("register")}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    activeAuthTab === "register"
                      ? "bg-white text-[#111827] shadow-xs"
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Sign In Form */}
              {activeAuthTab === "signin" ? (
                <form onSubmit={handleSignIn} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-[#111827] outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => alert("Password reset link has been dispatched to your email address.")}
                        className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        Forgot?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-[#111827] outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 rounded-xl bg-blue-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    Sign In
                  </button>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleRegister} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-[#111827] outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-[#111827] outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-[#111827] outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 rounded-xl bg-blue-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    Create Account
                  </button>
                </form>
              )}
            </div>

            {/* Quick Order Reference Lookup */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                  Instant Order Lookup
                </h2>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Purchased as a guest? Enter your Order Reference number from your confirmation email.
              </p>

              <form onSubmit={handleOrderLookup} className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. VEL-89421"
                  value={lookupOrderId}
                  onChange={(e) => setLookupOrderId(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-[#111827] outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-600 cursor-pointer transition-colors"
                >
                  Track
                </button>
              </form>

              {lookupError && (
                <p className="mt-2 text-[11px] font-medium text-red-600 animate-fadeIn">
                  {lookupError}
                </p>
              )}
            </div>
          </div>

          {/* Right Column (7 Cols): Order Tracking & Member Benefits */}
          <div className="lg:col-span-7 space-y-6">
            {/* Orders Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Fulfillment Status
                  </span>
                  <h2 className="text-lg font-black text-[#111827]">Recent Orders</h2>
                </div>
                {activeDisplayOrder && (
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    Active Order Found
                  </span>
                )}
              </div>

              {activeDisplayOrder ? (
                <div className="mt-6 space-y-6">
                  {/* Order Meta Bar */}
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        Order Reference
                      </span>
                      <p className="font-mono font-bold text-sm text-[#111827]">
                        {activeDisplayOrder.id}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        Status
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-700">Confirmed & Processing</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        Total Amount
                      </span>
                      <p className="font-bold text-sm text-[#111827]">
                        {formatPrice(activeDisplayOrder.total, "INR")}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Timeline Stepper */}
                  <div className="py-2">
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-700 mb-2 gap-1">
                      <span className="text-blue-600">1. Order Placed</span>
                      <span className="text-blue-600">2. Processing</span>
                      <span className="text-slate-400">3. Shipped</span>
                      <span className="text-slate-400">4. Delivered</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full w-1/2 transition-all duration-700" />
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">
                      Estimated Delivery Window: <strong className="text-[#111827]">{activeDisplayOrder.estimatedDelivery || "3-5 Business Days"}</strong>
                    </p>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-slate-100 border-t border-slate-100 pt-4">
                    {activeDisplayOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 py-3">
                        <div className="relative h-14 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                          <Image
                            src={item.product.image || item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs font-bold text-[#111827] line-clamp-1">
                            {item.product.name}
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Qty: {item.quantity} • {formatPrice(item.product.price, "INR")}
                          </p>
                        </div>
                        <div className="text-right font-mono text-xs font-bold text-[#111827]">
                          {formatPrice(item.product.price * item.quantity, "INR")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Empty Orders State */
                <div className="py-12 text-center space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#111827]">No Active Orders in Session</h3>
                    <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Orders placed during this session will display here automatically. You can also use the Instant Order Lookup to check prior purchases.
                    </p>
                  </div>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    <span>Start Shopping</span>
                    <span>→</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Member Benefits Grid */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="border-b border-slate-100 pb-3 mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Privileges
                </span>
                <h2 className="text-lg font-black text-[#111827]">VELORA Membership Benefits</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-[#F8F9FC] p-4 space-y-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-bold text-[#111827]">Express 1-Click Checkout</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Save delivery coordinates and payment preferences for streamlined mobile checkout.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-[#F8F9FC] p-4 space-y-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-bold text-[#111827]">Personal Wardrobe Wishlist</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Curate private capsules, track inventory restocks, and receive low-stock alerts.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-[#F8F9FC] p-4 space-y-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-bold text-[#111827]">Real-Time Order Tracking</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Live GPS courier tracking, estimated arrival timestamps, and instant SMS updates.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-[#F8F9FC] p-4 space-y-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-bold text-[#111827]">VIP Atelier Pre-Access</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Early access to seasonal capsule drops and private client shopping invitations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
