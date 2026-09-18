"use client";

import React, { use } from "react";
import Link from "next/link";
import { useProduct } from "@/hooks/useProducts";
import { ProductDetailsClient } from "@/components/modules/ProductDetailsClient";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const { product, loading, error, isNotFound, refetch } = useProduct(resolvedParams.id);

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
          <div className="h-4 w-48 bg-slate-200 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-7 aspect-[3/4] rounded-2xl bg-slate-200 animate-pulse" />
            <div className="lg:col-span-5 space-y-6">
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-1/3 bg-slate-200 rounded animate-pulse" />
              <div className="h-24 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-12 w-full bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // API error state
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h1 className="text-2xl font-black text-red-600">
          Error Loading Product
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          {error}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button
            type="button"
            onClick={refetch}
            className="rounded-lg bg-blue-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 cursor-pointer shadow-sm"
          >
            Try Again
          </button>
          <Link
            href="/products"
            className="rounded-lg border border-slate-300 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100"
          >
            Back to Catalogue
          </Link>
        </div>
      </div>
    );
  }

  // Not found state
  if (isNotFound || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h1 className="text-3xl font-black text-[#111827]">
          Product Not Found
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          The piece you are looking for does not exist in our catalogue or has been removed.
        </p>
        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex rounded-lg bg-blue-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 shadow-sm"
          >
            Return to Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs uppercase tracking-wider text-slate-500 mb-8 sm:mb-12">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600 transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-slate-500">{product.category}</span>
          <span>/</span>
          <span className="font-bold text-[#111827] truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Dynamic Product Details (Image, Info, Stepper, Add to Cart) */}
        <ProductDetailsClient product={product} />
      </div>
    </div>
  );
}
