"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/common/Button";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    cartCount,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 100;
  const progress = Math.min((cartTotal / freeShippingThreshold) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn">
      <div className="relative flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl text-[#111827]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold uppercase tracking-wider text-[#111827]">
              Shopping Bag
            </h2>
            <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              {cartCount}
            </span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
            aria-label="Close cart drawer"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="my-4 rounded-lg bg-[#EFF6FF] border border-blue-100 p-3 text-xs text-blue-900">
          <div className="flex justify-between font-medium">
            <span>
              {cartTotal >= freeShippingThreshold
                ? "🎉 You qualified for Free Express Shipping!"
                : `Add ${formatPrice(freeShippingThreshold - cartTotal)} more for Free Shipping`}
            </span>
            <span className="font-bold text-blue-700">{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-blue-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
              <svg className="h-12 w-12 stroke-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="mt-4 text-sm font-medium text-slate-700">Your shopping bag is empty.</p>
              <p className="mt-1 text-xs text-slate-500">Explore our new arrivals and find your fit.</p>
              <Link
                href="/products"
                onClick={closeCart}
                className="mt-4 inline-flex items-center text-xs font-bold uppercase tracking-wider text-blue-600 underline underline-offset-4 hover:text-blue-700"
              >
                Browse Catalogue →
              </Link>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-4 py-4">
                <Link
                  href={`/products/${product.id}`}
                  onClick={closeCart}
                  className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-slate-100 cursor-pointer"
                >
                  <Image
                    src={product.image || product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${product.id}`}
                        onClick={closeCart}
                        className="text-sm font-semibold line-clamp-1 hover:underline text-[#111827]"
                      >
                        {product.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        className="text-slate-400 hover:text-red-500 cursor-pointer p-0.5"
                        aria-label={`Remove ${product.name}`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <span className="text-xs text-slate-500 uppercase">{product.category}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium pt-2">
                    {/* Stepper */}
                    <div className="inline-flex items-center rounded border border-slate-200">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(product.id)}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="px-2 font-semibold text-slate-800">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => increaseQuantity(product.id)}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold text-[#111827]">{formatPrice(product.price * quantity, product.currency)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="flex justify-between text-sm font-bold text-[#111827]">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Taxes and shipping calculated at final checkout step.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/cart"
                onClick={closeCart}
                className="w-full text-center py-2.5 rounded-lg border border-slate-300 bg-white text-xs font-bold uppercase tracking-wider text-slate-800 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                View Full Bag ({cartCount})
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full text-center py-3 bg-blue-600 text-white hover:bg-blue-700 font-bold uppercase tracking-wider text-xs rounded-lg shadow-md cursor-pointer transition-colors"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

