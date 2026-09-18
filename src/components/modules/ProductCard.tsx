"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const isLowStock = product.stock > 0 && product.stock <= 8;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:border-slate-400 hover:shadow-lg">
      {/* Product Image Container with Link */}
      <Link
        href={`/products/${product.id}`}
        className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 block cursor-pointer"
        aria-label={`View details for ${product.name}`}
      >
        <Image
          src={product.image || product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badge (Trending, New, Bestseller) - Pink Accent */}
        {product.tag && (
          <div className="absolute top-3 left-3 z-10">
            <span className="rounded-full bg-pink-500 text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm">
              {product.tag}
            </span>
          </div>
        )}

        {/* Quick Wishlist Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          aria-label={`Save ${product.name} to wishlist`}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white hover:text-pink-500 cursor-pointer shadow-sm"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>

        {/* Desktop Quick Add Button Overlay */}
        <div className="absolute inset-x-3 bottom-3 hidden translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:block z-10">
          <button
            type="button"
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`w-full rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer ${
              product.stock === 0
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : added
                ? "bg-emerald-600 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {product.stock === 0 ? "Out of Stock" : added ? "✓ Added to Bag" : "Quick Add +"}
          </button>
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-slate-400">
            {product.category}
          </span>
          {/* Rating */}
          <div className="flex items-center space-x-1">
            <span className="text-amber-500">★</span>
            <span className="font-medium text-slate-800">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-slate-400">({product.reviewCount})</span>
          </div>
        </div>

        <Link href={`/products/${product.id}`} className="group/title">
          <h3 className="mt-2 text-sm font-semibold tracking-tight text-[#111827] transition-colors group-hover/title:text-blue-600 line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 text-xs text-slate-500 line-clamp-1">
          {product.description}
        </p>

        {/* Availability indicator */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              product.stock === 0
                ? "bg-red-500"
                : isLowStock
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
          ></span>
          <span className="text-[11px] font-medium text-slate-500">
            {product.stock === 0
              ? "Out of Stock"
              : isLowStock
              ? `Low Stock (${product.stock} left)`
              : `In Stock`}
          </span>
        </div>

        {/* Price and Mobile Add button */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-baseline space-x-2">
            <span className="text-base font-bold text-[#111827]">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.originalPrice, product.currency)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`rounded-lg px-3.5 py-2 min-h-[36px] text-xs font-bold uppercase tracking-wider transition-all sm:hidden cursor-pointer active:scale-95 shadow-2xs ${
              product.stock === 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : added
                ? "bg-emerald-600 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {product.stock === 0 ? "Sold" : added ? "Added" : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
