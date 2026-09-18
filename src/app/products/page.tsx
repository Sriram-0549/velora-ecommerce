"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/modules/ProductCard";
import { useCart } from "@/context/CartContext";

const categories = ["All", "Women", "Men", "Accessories", "New Arrivals"] as const;
type CategoryType = (typeof categories)[number];

type SortOption = "featured" | "price-asc" | "price-desc" | "rating";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("search") || "";
  const initialCategoryParam = searchParams.get("category");
  const matchedCategory = categories.find(
    (c) => c.toLowerCase() === initialCategoryParam?.toLowerCase()
  ) || "All";

  const { addToCart } = useCart();
  const { products: allProducts, loading, error, refetch } = useProducts();

  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(matchedCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("search") || "";
    if (q) setSearchQuery(q);
    const cat = searchParams.get("category");
    if (cat) {
      const match = categories.find((c) => c.toLowerCase() === cat.toLowerCase());
      if (match) setSelectedCategory(match);
    }
  }, [searchParams]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = allProducts;

    // Category filter (case-insensitive for database compatibility)
    if (selectedCategory !== "All") {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search query filter (matches name, description, or category)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    const sorted = [...result];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "featured":
      default:
        break;
    }

    return sorted;
  }, [allProducts, selectedCategory, searchQuery, sortBy]);

  const handleClearFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setSortBy("featured");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-20">
      {/* Header Banner */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col space-y-3">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-xs text-slate-500 uppercase tracking-wider">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="font-bold text-[#111827]">Shop All</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#111827]">
              The VELORA Collection
            </h1>
            <p className="max-w-xl text-sm sm:text-base text-slate-600">
              Explore our full catalogue of modern essentials, sculptural outerwear, and minimalist accessories.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Controls: Search Bar, Category Filters, Sort Dropdown */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between pb-8 border-b border-slate-200">
          {/* Search Input */}
          <div className="relative w-full lg:max-w-md">
            <svg
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search products by name, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-[#111827] outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold uppercase text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs & Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
            {/* Category Filter Pills (scrollable on mobile, wrapping on desktop) */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const count =
                  cat === "All"
                    ? allProducts.length
                    : allProducts.filter(
                        (p) => p.category.toLowerCase() === cat.toLowerCase()
                      ).length;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 sm:px-4 py-2 text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 sm:pl-3 sm:border-l border-slate-200 shrink-0 self-end sm:self-auto">
              <label htmlFor="sort" className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Sort:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-lg border border-slate-300 bg-white py-1.5 px-3 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="pt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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

        {/* API Error State */}
        {!loading && error && (
          <div className="my-12 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <h3 className="text-base font-bold text-red-800">
              Failed to load catalogue
            </h3>
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
            <button
              type="button"
              onClick={refetch}
              className="mt-6 rounded-lg bg-red-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Active Content when not loading and no error */}
        {!loading && !error && (
          <>
            {/* Status bar */}
            <div className="flex items-center justify-between py-4 text-xs text-slate-500">
              <span>
                Showing <strong className="text-[#111827]">{filteredProducts.length}</strong> of {allProducts.length} pieces
                {searchQuery && ` for "${searchQuery}"`}
              </span>

              {(searchQuery || selectedCategory !== "All" || sortBy !== "featured") && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Product Grid or Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="my-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 text-center">
                <svg
                  className="h-12 w-12 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-bold text-[#111827]">
                  No products found
                </h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  {allProducts.length === 0
                    ? "Your database currently has no products listed. Add products to your Supabase products table to see them appear."
                    : "We couldn't find any pieces matching your search. Try adjusting your query or resetting filters."}
                </p>
                {(searchQuery || selectedCategory !== "All") && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 cursor-pointer"
                  >
                    View All Products
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Loading catalogue...
            </p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
