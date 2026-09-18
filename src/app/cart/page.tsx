"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/common/Button";

export default function CartPage() {
  const {
    items,
    cartCount,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    isInitialized,
  } = useCart();

  // Promotional discount state
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  // Checkout modal state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Free shipping threshold
  const freeShippingThreshold = 100;
  const qualifiesForFreeShipping = cartTotal >= freeShippingThreshold;
  const shippingCost = qualifiesForFreeShipping || items.length === 0 ? 0 : 15;

  const discountAmount = (cartTotal * discountPercent) / 100;
  const finalTotal = Math.max(0, cartTotal - discountAmount + (items.length > 0 ? shippingCost : 0));
  const shippingProgress = Math.min((cartTotal / freeShippingThreshold) * 100, 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    setPromoSuccess(null);

    const cleanCode = promoCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === "VELORA15") {
      setDiscountPercent(15);
      setPromoSuccess("Promo code VELORA15 applied (15% off)!");
      setPromoCode("");
    } else if (cleanCode === "VELORA20") {
      setDiscountPercent(20);
      setPromoSuccess("VIP promo code applied (20% off)!");
      setPromoCode("");
    } else {
      setPromoError("Invalid code. Try VELORA15 for 15% off.");
    }
  };

  const handleRemovePromo = () => {
    setDiscountPercent(0);
    setPromoSuccess(null);
    setPromoError(null);
  };

  const handleProceedToCheckout = () => {
    setCheckoutModalOpen(true);
  };

  const handleCompleteOrder = () => {
    setOrderPlaced(true);
    setTimeout(() => {
      clearCart();
    }, 400);
  };

  const handleCloseCheckoutModal = () => {
    setCheckoutModalOpen(false);
    setOrderPlaced(false);
  };

  // SSR hydration placeholder to prevent mismatch
  if (!isInitialized) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F8F9FC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Loading Bag...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-24">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <nav className="flex items-center space-x-2 text-xs uppercase tracking-wider text-slate-500 mb-3">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-blue-600 transition-colors">
              Shop
            </Link>
            <span>/</span>
            <span className="font-bold text-[#111827]">Shopping Bag</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111827]">
                Shopping Bag
              </h1>
              {items.length > 0 && (
                <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  {cartCount} {cartCount === 1 ? "item" : "items"}
                </span>
              )}
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-red-600 transition-colors cursor-pointer self-start sm:self-auto"
              >
                Clear Bag
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {items.length === 0 ? (
          /* Empty Cart State - Luxury Fashion Style */
          <div className="mx-auto max-w-xl py-6 sm:py-12">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-12 text-center shadow-xs">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#EFF6FF] border border-blue-100 text-blue-600 shadow-xs">
                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.6"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.19-.578-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </div>

              <span className="mt-6 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
                VELORA Wardrobe
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-[#111827]">
                Your Shopping Bag is Empty
              </h2>
              <p className="mt-3 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Discover modern silhouettes, heavyweight oversized tees, and bespoke accessories crafted for effortless daily wear.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/products"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <span>Explore Collection</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/account"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Track Past Orders
                </Link>
              </div>

              {/* Trust Guarantees inside Card */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-6 text-left">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">
                    ✓
                  </span>
                  <div>
                    <p className="text-[11px] font-bold text-[#111827]">Free Delivery</p>
                    <p className="text-[10px] text-slate-400">On all orders $100+</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                    ↺
                  </span>
                  <div>
                    <p className="text-[11px] font-bold text-[#111827]">30-Day Returns</p>
                    <p className="text-[10px] text-slate-400">Doorstep pickups</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pink-50 text-xs font-bold text-pink-600">
                    ★
                  </span>
                  <div>
                    <p className="text-[11px] font-bold text-[#111827]">100% Authentic</p>
                    <p className="text-[10px] text-slate-400">Certified fabrics</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Category Suggestions */}
            <div className="mt-8 text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Popular Collections
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {[
                  { name: "Men's Essentials", href: "/products?category=Men" },
                  { name: "Women's Edit", href: "/products?category=Women" },
                  { name: "Accessories", href: "/products?category=Accessories" },
                  { name: "New Arrivals", href: "/products?category=New%20Arrivals" },
                ].map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-colors shadow-2xs"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Populated Cart Layout: 2 Columns on Desktop */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column (8 cols): Items Table / List */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Alert Box */}
              <div className="rounded-xl border border-blue-100 bg-[#EFF6FF] p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                  <span className="flex items-center gap-2">
                    <span>{qualifiesForFreeShipping ? "🎉" : "🚚"}</span>
                    <span>
                      {qualifiesForFreeShipping
                        ? "You qualified for Complimentary Worldwide Express Shipping!"
                        : `Add ${formatPrice(freeShippingThreshold - cartTotal)} more to qualify for Free Shipping`}
                    </span>
                  </span>
                  <span className="font-bold text-blue-700">{Math.round(shippingProgress)}%</span>
                </div>
                <div className="mt-2.5 h-2 w-full rounded-full bg-blue-200 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                    style={{ width: `${shippingProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Items Card */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                {/* Desktop Table Headers */}
                <div className="hidden sm:grid grid-cols-12 gap-4 border-b border-slate-200 px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>

                {/* Items Rows */}
                <div className="divide-y divide-slate-100">
                  {items.map(({ product, quantity }) => {
                    const itemSubtotal = product.price * quantity;
                    const isLowStock = product.stock > 0 && product.stock <= 8;

                    return (
                      <div
                        key={product.id}
                        className="p-4 sm:p-6 transition-colors hover:bg-slate-50/50"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                          {/* Product Info (Col 1-6) */}
                          <div className="sm:col-span-6 flex items-center gap-4">
                            <Link
                              href={`/products/${product.id}`}
                              className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200 cursor-pointer group"
                            >
                              <Image
                                src={product.image || product.imageUrl}
                                alt={product.name}
                                fill
                                sizes="80px"
                                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                              />
                            </Link>

                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {product.category}
                              </span>
                              <Link
                                href={`/products/${product.id}`}
                                className="block font-semibold text-sm sm:text-base text-[#111827] hover:text-blue-600 transition-colors line-clamp-1"
                              >
                                {product.name}
                              </Link>

                              <div className="mt-1 flex items-center gap-2">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    isLowStock ? "bg-amber-500" : "bg-emerald-500"
                                  }`}
                                />
                                <span className="text-[11px] text-slate-500">
                                  {isLowStock ? `Low stock (${product.stock} left)` : "In Stock"}
                                </span>
                              </div>

                              {/* Mobile Only: Unit price inline */}
                              <div className="mt-2 text-xs font-bold text-[#111827] sm:hidden">
                                {formatPrice(product.price, product.currency)} each
                              </div>
                            </div>
                          </div>

                          {/* Desktop Unit Price (Col 7-8) */}
                          <div className="hidden sm:block sm:col-span-2 text-center text-sm font-semibold text-slate-700">
                            {formatPrice(product.price, product.currency)}
                          </div>

                          {/* Quantity Controls (Col 9-10) */}
                          <div className="sm:col-span-2 flex sm:justify-center items-center gap-3">
                            <div className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white">
                              <button
                                type="button"
                                onClick={() => decreaseQuantity(product.id)}
                                className="flex h-8 w-8 items-center justify-center text-sm font-medium text-slate-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                aria-label={`Decrease quantity of ${product.name}`}
                              >
                                −
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-[#111827]">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => increaseQuantity(product.id)}
                                disabled={quantity >= (product.stock || 99)}
                                className="flex h-8 w-8 items-center justify-center text-sm font-medium text-slate-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                aria-label={`Increase quantity of ${product.name}`}
                              >
                                +
                              </button>
                            </div>

                            {/* Mobile Remove icon */}
                            <button
                              type="button"
                              onClick={() => removeFromCart(product.id)}
                              className="p-2 text-slate-400 hover:text-red-600 transition-colors sm:hidden cursor-pointer active:scale-90"
                              aria-label={`Remove ${product.name}`}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.75"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Desktop Subtotal & Remove (Col 11-12) */}
                          <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-3">
                            <span className="sm:hidden text-xs text-slate-500">Subtotal:</span>
                            <span className="text-sm sm:text-base font-bold text-[#111827]">
                              {formatPrice(itemSubtotal, product.currency)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFromCart(product.id)}
                              className="hidden sm:inline-flex items-center justify-center h-8 w-8 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Remove item"
                              aria-label={`Remove ${product.name}`}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.75"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons below Items */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-blue-600 transition-colors"
                >
                  <span>←</span>
                  <span>Continue Shopping</span>
                </Link>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>🔒 Guaranteed Safe & Secure Checkout</span>
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Order Summary Sidebar */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <h2 className="text-base font-bold uppercase tracking-wider text-[#111827] pb-4 border-b border-slate-100">
                  Order Summary
                </h2>

                {/* Subtotals breakdown */}
                <div className="space-y-3 py-4 text-xs font-medium text-slate-600 border-b border-slate-100">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-[#111827]">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <span>Shipping</span>
                      {qualifiesForFreeShipping && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700">
                          FREE
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-[#111827]">
                      {shippingCost === 0 ? "Complimentary" : formatPrice(shippingCost)}
                    </span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex justify-between items-center text-emerald-600">
                      <span className="flex items-center gap-1">
                        <span>Discount ({discountPercent}%)</span>
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="text-[10px] underline hover:text-red-500 cursor-pointer ml-1"
                        >
                          Remove
                        </button>
                      </span>
                      <span className="font-bold">−{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Estimated Sales Tax</span>
                    <span className="text-slate-400">Calculated at checkout</span>
                  </div>
                </div>

                {/* Promo Code Form */}
                <div className="py-4 border-b border-slate-100">
                  <form onSubmit={handleApplyPromo} className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Promotional Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="e.g. VELORA15"
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs text-[#111827] outline-none uppercase placeholder:normal-case placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-700 hover:bg-blue-100 cursor-pointer transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {promoSuccess && (
                      <p className="text-[11px] font-semibold text-emerald-600">
                        ✓ {promoSuccess}
                      </p>
                    )}
                    {promoError && (
                      <p className="text-[11px] font-medium text-red-500">
                        {promoError}
                      </p>
                    )}
                  </form>
                </div>

                {/* Final Total */}
                <div className="py-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-sm font-bold uppercase tracking-wider text-[#111827]">
                        Total
                      </span>
                      <p className="text-[11px] text-slate-400">Including all applicable taxes</p>
                    </div>
                    <span className="text-2xl font-black text-[#111827]">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full h-12 flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 font-bold uppercase tracking-wider text-xs rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Proceed to Checkout • {formatPrice(finalTotal)}
                </Link>

                {/* Value Guarantees list */}
                <div className="mt-6 space-y-2.5 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Complimentary express delivery over $100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>30-Day doorstep returns & free exchanges</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Encrypted & secure SSL checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal Dialog */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
            {!orderPlaced ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      VELORA Concierge
                    </span>
                    <h3 className="text-lg font-black tracking-tight text-[#111827]">
                      Checkout Verification
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseCheckoutModal}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                </div>

                <div className="my-6 space-y-4 text-xs text-slate-600">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                    <div className="flex justify-between font-medium">
                      <span>Total Items:</span>
                      <span className="font-bold text-[#111827]">{cartCount} items</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Order Subtotal:</span>
                      <span className="font-bold text-[#111827]">{formatPrice(cartTotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between font-medium text-emerald-600">
                        <span>Promo Savings:</span>
                        <span className="font-bold">−{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium">
                      <span>Shipping Method:</span>
                      <span className="font-bold text-[#111827]">
                        {qualifiesForFreeShipping ? "Free Express Delivery (3-5 Days)" : "Standard Delivery ($15.00)"}
                      </span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-[#111827]">
                      <span>Total Due:</span>
                      <span>{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-500">
                    This is a front-end demonstration of the VELORA checkout sequence. In production, this completes payment via Stripe/Shopify Pay and dispatches orders to warehouse fulfillment.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    onClick={handleCompleteOrder}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700 font-bold uppercase tracking-wider text-xs rounded-xl shadow-sm cursor-pointer"
                  >
                    Simulate Place Order
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleCloseCheckoutModal}
                    className="sm:w-auto text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              /* Order Confirmation Celebration */
              <div className="text-center py-6 space-y-4 animate-scaleIn">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-[#111827]">
                  Thank You for Your Order!
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your order <strong className="text-[#111827]">#VEL-89421</strong> has been successfully placed. A confirmation email and tracking link will be sent to your inbox.
                </p>
                <div className="pt-4">
                  <Link
                    href="/products"
                    onClick={handleCloseCheckoutModal}
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 cursor-pointer shadow-sm"
                  >
                    Explore More Pieces
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
