"use client";

import React, { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/modules/ProductCard";
import { useCart } from "@/context/CartContext";

const filterTabs = ["All", "Women", "Men", "Accessories", "New Arrivals"] as const;

export function FeaturedProducts() {
  const { addToCart } = useCart();
  const { products, loading, error, refetch } = useProducts();
  const [activeTab, setActiveTab] = useState<string>("All");

  const filteredProducts =
    activeTab === "All"
      ? products
      : products.filter(
          (item) => item.category.toLowerCase() === activeTab.toLowerCase()
        );

  return (
    <section id="shop" className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              The Essentials Collection
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#111827]">
              Featured Products
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Thoughtfully curated for daily versatility and lasting elegance.
            </p>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 animate-pulse"
              >
                <div className="aspect-[3/4] w-full rounded-lg bg-slate-200 mb-4" />
                <div className="h-4 w-1/3 bg-slate-200 rounded mb-2" />
                <div className="h-5 w-3/4 bg-slate-200 rounded mb-4" />
                <div className="h-4 w-1/4 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-semibold text-red-700">
              Unable to load products from database: {error}
            </p>
            <button
              type="button"
              onClick={refetch}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
            <p className="text-base font-semibold text-slate-800">
              No products found in this category.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Select another category or view all products.
            </p>
            {activeTab !== "All" && (
              <button
                type="button"
                onClick={() => setActiveTab("All")}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 cursor-pointer"
              >
                Show All
              </button>
            )}
          </div>
        )}

        {/* Product Cards Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
