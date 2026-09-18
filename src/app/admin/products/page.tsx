"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductCategory } from "@/types";
import { mapSupabaseProductToProduct } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/utils";
import AdminNav from "@/components/admin/AdminNav";

const CATEGORIES: ProductCategory[] = ["Women", "Men", "Accessories", "New Arrivals"];

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: ProductCategory;
  image: string;
  rating: string;
  stock: string;
}

const initialFormData: ProductFormData = {
  name: "",
  description: "",
  price: "",
  category: "Men",
  image: "",
  rating: "4.8",
  stock: "15",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation modal state
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Fetch products from GET /api/products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/products", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: expected product array.");
      }

      setProducts(data.map(mapSupabaseProductToProduct));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load products";
      console.error("fetchProducts error:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Form Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Product name is required.";
    }

    const priceNum = Number(formData.price);
    if (!formData.price || isNaN(priceNum) || priceNum < 0) {
      errors.price = "Price must be a valid non-negative number.";
    }

    if (!formData.category) {
      errors.category = "Category is required.";
    }

    const stockNum = Number(formData.stock);
    if (!formData.stock || isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      errors.stock = "Stock must be a valid non-negative integer.";
    }

    const ratingNum = Number(formData.rating);
    if (formData.rating && (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5)) {
      errors.rating = "Rating must be between 0.0 and 5.0.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData(initialFormData);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      category: product.category,
      image: product.image?.includes("unsplash.com/photo-1521572267360") ? "" : product.image || "",
      rating: String(product.rating || 4.8),
      stock: String(product.stock),
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Submit Add or Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      price: Number(formData.price),
      category: formData.category,
      image: formData.image.trim() || null,
      rating: Number(formData.rating || 4.8),
      stock: Number(formData.stock),
    };

    try {
      if (editingProduct) {
        // PUT /api/products/[id]
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || data.error || `Update failed (${res.status})`);
        }

        showToast(`Product "${payload.name}" updated successfully.`);
      } else {
        // POST /api/products
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || data.error || `Creation failed (${res.status})`);
        }

        showToast(`New product "${payload.name}" added to catalogue.`);
      }

      setIsFormModalOpen(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save product";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm and Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || `Deletion failed (${res.status})`);
      }

      showToast(`Product "${deletingProduct.name}" deleted from store.`);
      setDeletingProduct(null);
      await fetchProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete product";
      showToast(msg, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        String(p.id).includes(searchQuery.trim());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Inventory stats
  const totalStockCount = useMemo(() => {
    return products.reduce((acc, p) => acc + p.stock, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  }, [products]);

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-24">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 text-xs font-semibold shadow-2xl transition-all ${
            toast.type === "success"
              ? "border border-emerald-500/40 bg-[#111827] text-white"
              : "border border-red-500/40 bg-red-950 text-red-100"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              toast.type === "success" ? "bg-emerald-400" : "bg-red-400"
            }`}
          />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Admin Navigation Bar */}
      <AdminNav activeTab="products" productCount={products.length} />

      {/* Admin Top Header Banner */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                <Link
                  href="/"
                  className="hover:text-blue-600 transition-colors"
                >
                  Storefront
                </Link>
                <span>/</span>
                <span className="text-[#111827]">Admin Management</span>
                <span className="rounded-full bg-blue-100 border border-blue-200 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">
                  Demo
                </span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#111827]">
                Catalogue Products
              </h1>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-600">
                Live PostgreSQL inventory synced with your customer storefront. Add, edit, or remove store pieces.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchProducts}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition-all"
                title="Refresh product list"
              >
                <svg
                  className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-blue-700 cursor-pointer transition-all"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-slate-100 pt-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Products
              </span>
              <p className="mt-1 text-2xl font-black text-[#111827]">
                {products.length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Units in Inventory
              </span>
              <p className="mt-1 text-2xl font-black text-[#111827]">
                {totalStockCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Low Stock (&le; 5)
              </span>
              <p className="mt-1 text-2xl font-black text-amber-600">
                {lowStockCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Active Categories
              </span>
              <p className="mt-1 text-2xl font-black text-[#111827]">
                {new Set(products.map((p) => p.category)).size}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Controls: Search bar & Category filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6">
          <div className="relative w-full sm:max-w-xs">
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
              placeholder="Search by name, ID, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-[#111827] outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full sm:flex-wrap">
            {["All", ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-blue-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 w-full animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="text-sm font-bold text-red-800">
              Database Connection Failed
            </h2>
            <p className="mt-1 text-xs text-red-600">{error}</p>
            <button
              type="button"
              onClick={fetchProducts}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <svg
              className="mx-auto h-12 w-12 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="mt-4 text-base font-bold text-[#111827]">
              {products.length === 0 ? "No Products in Catalogue" : "No Products Match Your Filter"}
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {products.length === 0
                ? "Your Supabase products table is currently empty. Click 'Add Product' to list your first piece."
                : "Try adjusting your search query or selecting another category."}
            </p>
            {products.length === 0 ? (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 shadow-sm cursor-pointer"
              >
                + Add First Product
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-6 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* Responsive Table of Products */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th scope="col" className="py-3.5 pl-6 pr-3">Product</th>
                    <th scope="col" className="px-3 py-3.5">Category</th>
                    <th scope="col" className="px-3 py-3.5">Price</th>
                    <th scope="col" className="px-3 py-3.5">Stock</th>
                    <th scope="col" className="px-3 py-3.5">Rating</th>
                    <th scope="col" className="py-3.5 pl-3 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredProducts.map((product) => {
                    const isLowStock = product.stock > 0 && product.stock <= 5;
                    const isOutOfStock = product.stock === 0;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Product Image & Name */}
                        <td className="py-4 pl-6 pr-3">
                          <div className="flex items-center gap-3.5">
                            <div className="relative h-12 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                              <Image
                                src={product.image || product.imageUrl}
                                alt={product.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#111827] line-clamp-1">
                                  {product.name}
                                </span>
                                <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono text-slate-500 border border-slate-200">
                                  #{product.id}
                                </span>
                              </div>
                              {product.description && (
                                <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1 max-w-sm">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="whitespace-nowrap px-3 py-4">
                          <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 border border-slate-200">
                            {product.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="whitespace-nowrap px-3 py-4 font-bold text-[#111827]">
                          {formatPrice(product.price, product.currency)}
                        </td>

                        {/* Stock Badge */}
                        <td className="whitespace-nowrap px-3 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                              isOutOfStock
                                ? "bg-red-50 text-red-700 border-red-200"
                                : isLowStock
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isOutOfStock
                                  ? "bg-red-500"
                                  : isLowStock
                                  ? "bg-amber-500 animate-pulse"
                                  : "bg-emerald-500"
                              }`}
                            />
                            <span>
                              {isOutOfStock
                                ? "Out of Stock"
                                : isLowStock
                                ? `Low (${product.stock})`
                                : `${product.stock} in stock`}
                            </span>
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="whitespace-nowrap px-3 py-4 font-medium">
                          <span className="inline-flex items-center gap-1">
                            <span className="text-amber-500">★</span>
                            <span className="font-bold text-[#111827]">
                              {Number(product.rating || 0).toFixed(1)}
                            </span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Store Preview Link */}
                            <Link
                              href={`/products/${product.id}`}
                              target="_blank"
                              title="Preview on live storefront"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.75"
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </Link>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(product)}
                              title="Edit product details"
                              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-blue-600 cursor-pointer transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.75"
                                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                />
                              </svg>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => setDeletingProduct(product)}
                              title="Delete product"
                              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 cursor-pointer transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.75"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3 text-[11px] text-slate-500">
              <span>
                Showing <strong>{filteredProducts.length}</strong> of {products.length} catalogue items
              </span>
              <span>Sorted by latest creation</span>
            </div>
          </div>
        )}
      </main>

      {/* 2. ADD / EDIT PRODUCT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => !isSubmitting && setIsFormModalOpen(false)}
          />

          {/* Modal Dialog Content */}
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-8 shadow-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {editingProduct ? "Update Record" : "New Inventory Entry"}
                </span>
                <h2 className="text-lg font-black text-[#111827]">
                  {editingProduct ? `Edit "${editingProduct.name}"` : "Add New Product"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                disabled={isSubmitting}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="overflow-y-auto pt-4 space-y-4 flex-1">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sculptural Wool Trench"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-[#111827] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                {formErrors.name && (
                  <p className="mt-1 text-[11px] font-medium text-red-500">{formErrors.name}</p>
                )}
              </div>

              {/* Category & Price Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ProductCategory })
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-[#111827] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="mt-1 text-[11px] font-medium text-red-500">{formErrors.category}</p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Price (₹ / $) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 1999"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-[#111827] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                  {formErrors.price && (
                    <p className="mt-1 text-[11px] font-medium text-red-500">{formErrors.price}</p>
                  )}
                </div>
              </div>

              {/* Stock & Rating Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Stock */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Inventory Stock Units *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="e.g. 25"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-[#111827] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                  {formErrors.stock && (
                    <p className="mt-1 text-[11px] font-medium text-red-500">{formErrors.stock}</p>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Rating (0.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    placeholder="4.8"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-[#111827] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                  {formErrors.rating && (
                    <p className="mt-1 text-[11px] font-medium text-red-500">{formErrors.rating}</p>
                  )}
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Image URL (HTTPS)
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-[#111827] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  Leave blank to automatically use the high-resolution VELORA studio placeholder.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe fabric, cut, and craftsmanship..."
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-[#111827] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-blue-700 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Saving...</span>
                    </span>
                  ) : editingProduct ? (
                    "Save Changes"
                  ) : (
                    "Create Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DELETE CONFIRMATION MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => !isDeleting && setDeletingProduct(null)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 mb-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-black text-[#111827]">
              Delete Product
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-[#111827] font-bold">
                "{deletingProduct.name}"
              </strong>
              ? This item will be permanently removed from your Supabase catalogue and customer storefront.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                disabled={isDeleting}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-red-700 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
