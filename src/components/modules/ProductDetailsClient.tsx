"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/common/Button";

interface ProductDetailsClientProps {
  product: Product;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "shipping" | "sustainability">("details");

  const isLowStock = product.stock > 0 && product.stock <= 8;
  const isOutOfStock = product.stock === 0;

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
      {/* Left Column: Product Image Gallery */}
      <div className="lg:col-span-7 space-y-4">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-md border border-slate-200">
          <Image
            src={product.image || product.imageUrl}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover object-center transition-all duration-500 hover:scale-102"
          />

          {/* Tag Badge - Pink Accent */}
          {product.tag && (
            <div className="absolute top-4 left-4 z-10">
              <span className="rounded-full bg-pink-500 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                {product.tag}
              </span>
            </div>
          )}

          {/* Stock Floating Pill */}
          <div className="absolute bottom-4 left-4 z-10">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-md shadow-sm ${
                isOutOfStock
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : isLowStock
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-white/95 text-slate-800 border border-slate-200"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isOutOfStock
                    ? "bg-red-500"
                    : isLowStock
                    ? "bg-amber-500 animate-pulse"
                    : "bg-emerald-500"
                }`}
              ></span>
              {isOutOfStock
                ? "Sold Out"
                : isLowStock
                ? `Low Stock (${product.stock} units remaining)`
                : `In Stock (${product.stock} units available)`}
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Product Info & Actions */}
      <div className="lg:col-span-5 flex flex-col space-y-6">
        {/* Category & Rating Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            {product.category}
          </span>
          <div className="flex items-center space-x-2">
            <div className="flex text-amber-500 text-sm">
              {"★".repeat(Math.round(product.rating))}
            </div>
            <span className="text-xs font-bold text-[#111827]">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">
              ({product.reviewCount} customer reviews)
            </span>
          </div>
        </div>

        {/* Product Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#111827]">
            {product.name}
          </h1>
          <div className="mt-3 flex items-baseline space-x-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.originalPrice && (
              <span className="text-base text-slate-400 line-through">
                {formatPrice(product.originalPrice, product.currency)}
              </span>
            )}
            {product.originalPrice && (
              <span className="rounded-full bg-[#FDF2F8] border border-pink-200 px-2.5 py-0.5 text-xs font-bold text-pink-700">
                Save {formatPrice(product.originalPrice - product.price, product.currency)}
              </span>
            )}
          </div>
        </div>

        {/* Narrative Description */}
        <p className="text-sm leading-relaxed text-slate-600">
          {product.description}
        </p>

        {/* Quantity Selector & Add to Cart Section */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Quantity
          </label>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Stepper */}
            <div className="inline-flex h-12 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 sm:w-36">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={quantity <= 1 || isOutOfStock}
                className="flex h-8 w-8 items-center justify-center text-lg font-medium text-slate-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-bold text-[#111827]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrease}
                disabled={quantity >= product.stock || isOutOfStock}
                className="flex h-8 w-8 items-center justify-center text-lg font-medium text-slate-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 h-12 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer ${
                isOutOfStock
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : added
                  ? "bg-emerald-600 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isOutOfStock
                ? "Out of Stock"
                : added
                ? `✓ Added ${quantity} to Bag`
                : `Add to Cart • ${formatPrice(product.price * quantity, product.currency)}`}
            </Button>
          </div>
        </div>

        {/* Value Guarantees list */}
        <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span> Free express delivery &gt; $100
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span> 30-Day doorstep returns
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span> 100% Certified authentic
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span> Carbon-neutral packaging
          </div>
        </div>

        {/* Specifications / Accordion Tabs */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`pb-3 border-b-2 cursor-pointer transition-colors ${
                activeTab === "details"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              Material & Specs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shipping")}
              className={`ml-6 pb-3 border-b-2 cursor-pointer transition-colors ${
                activeTab === "shipping"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              Shipping & Care
            </button>
          </div>

          <div className="py-4 text-xs leading-relaxed text-slate-600">
            {activeTab === "details" && (
              <div className="space-y-2">
                {product.details ? (
                  <>
                    <p><strong className="text-[#111827]">Composition:</strong> {product.details.material}</p>
                    <p><strong className="text-[#111827]">Fit:</strong> {product.details.fit}</p>
                    <p><strong className="text-[#111827]">Origin:</strong> {product.details.origin}</p>
                  </>
                ) : (
                  <p>Expertly tailored with premium ethical textiles designed to maintain form over years of wear.</p>
                )}
              </div>
            )}
            {activeTab === "shipping" && (
              <div className="space-y-2">
                {product.details?.care && (
                  <p><strong className="text-[#111827]">Care:</strong> {product.details.care}</p>
                )}
                <p>Standard delivery arrives in 3-5 business days. Express next-day dispatch available at checkout.</p>
                <p>Complimentary prepaid returns label included in your parcel.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
