"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { AdminOrder, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import AdminNav from "@/components/admin/AdminNav";

const STATUS_FILTERS: Array<"All" | OrderStatus> = [
  "All",
  "processing",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"All" | OrderStatus>("All");

  // Fetch orders from GET /api/orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/orders", {
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
        throw new Error("Invalid response format: expected order array.");
      }

      setOrders(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load orders";
      console.error("fetchOrders error:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        selectedStatus === "All" ||
        order.status.toLowerCase() === selectedStatus.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        order.customer_name.toLowerCase().includes(q) ||
        order.customer_email.toLowerCase().includes(q) ||
        order.customer_phone?.toLowerCase().includes(q) ||
        order.city?.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [orders, selectedStatus, searchQuery]);

  // Inventory & financial stats
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== "cancelled")
      .reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  }, [orders]);

  const activeProcessingCount = useMemo(() => {
    return orders.filter((o) => o.status === "processing" || o.status === "confirmed").length;
  }, [orders]);

  const completedCount = useMemo(() => {
    return orders.filter((o) => o.status === "delivered").length;
  }, [orders]);

  // Color badge helpers
  const getStatusBadgeClass = (status: OrderStatus | string) => {
    switch (status) {
      case "processing":
        return "bg-amber-50 text-amber-800 border border-amber-200";
      case "confirmed":
        return "bg-blue-50 text-blue-800 border border-blue-200";
      case "shipped":
        return "bg-purple-50 text-purple-800 border border-purple-200";
      case "delivered":
        return "bg-emerald-50 text-emerald-800 border border-emerald-200";
      case "cancelled":
        return "bg-red-50 text-red-800 border border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border border-slate-200";
    }
  };

  const getStatusDotClass = (status: OrderStatus | string) => {
    switch (status) {
      case "processing":
        return "bg-amber-500 animate-pulse";
      case "confirmed":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-emerald-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-slate-400";
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-24">
      {/* Shared Admin Navigation */}
      <AdminNav activeTab="orders" orderCount={orders.length} />

      {/* Top Header Banner */}
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
                <span className="rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">
                  Orders
                </span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#111827]">
                Customer Orders
              </h1>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-600">
                Authoritative real-time client purchases stored in Supabase. Inspect line items, update delivery fulfillment, and track client revenue.
              </p>
            </div>

            {/* Refresh Action */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchOrders}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-xs hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 disabled:opacity-50 cursor-pointer transition-all"
                title="Refresh order records"
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
                <span>Refresh Orders</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-slate-100 pt-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Orders
              </span>
              <p className="mt-1 text-2xl font-black text-[#111827]">
                {loading ? (
                  <span className="inline-block h-8 w-10 animate-pulse rounded bg-slate-200" aria-label="Loading..." />
                ) : (
                  orders.length
                )}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Gross Revenue
              </span>
              <p className="mt-1 text-2xl font-black text-emerald-600">
                {loading ? (
                  <span className="inline-block h-8 w-20 animate-pulse rounded bg-slate-200" aria-label="Loading..." />
                ) : (
                  formatPrice(totalRevenue, "INR")
                )}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Pending / Processing
              </span>
              <p className="mt-1 text-2xl font-black text-amber-600">
                {loading ? (
                  <span className="inline-block h-8 w-10 animate-pulse rounded bg-slate-200" aria-label="Loading..." />
                ) : (
                  activeProcessingCount
                )}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Delivered Orders
              </span>
              <p className="mt-1 text-2xl font-black text-[#111827]">
                {loading ? (
                  <span className="inline-block h-8 w-10 animate-pulse rounded bg-slate-200" aria-label="Loading..." />
                ) : (
                  completedCount
                )}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search and Status Filters */}
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
              placeholder="Search by ID, name, email, city..."
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

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full sm:flex-wrap">
            {STATUS_FILTERS.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedStatus === st
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-blue-600"
                }`}
              >
                {st}
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
              Failed to Retrieve Orders
            </h2>
            <p className="mt-1 text-xs text-red-600">{error}</p>
            <button
              type="button"
              onClick={fetchOrders}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredOrders.length === 0 && (
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <h3 className="mt-4 text-base font-bold text-[#111827]">
              {orders.length === 0 ? "No Customer Orders Yet" : "No Orders Match Your Filter"}
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {orders.length === 0
                ? "As customers complete purchases through the VELORA storefront, incoming orders will appear here automatically."
                : "Try adjusting your search query or choosing another status filter."}
            </p>
            {orders.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("All");
                }}
                className="mt-6 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* Orders Table */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th scope="col" className="py-3.5 pl-6 pr-3">Order ID</th>
                    <th scope="col" className="px-3 py-3.5">Customer</th>
                    <th scope="col" className="px-3 py-3.5">Total</th>
                    <th scope="col" className="px-3 py-3.5">Payment</th>
                    <th scope="col" className="px-3 py-3.5">Order Status</th>
                    <th scope="col" className="px-3 py-3.5">Placed At</th>
                    <th scope="col" className="py-3.5 pl-3 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Order ID */}
                      <td className="whitespace-nowrap py-4 pl-6 pr-3 font-mono">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-bold text-[#111827] hover:text-blue-600 hover:underline"
                        >
                          {order.id}
                        </Link>
                      </td>

                      {/* Customer Info */}
                      <td className="px-3 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#111827] line-clamp-1">
                            {order.customer_name}
                          </span>
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {order.customer_email}
                          </span>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="whitespace-nowrap px-3 py-4 font-bold text-[#111827]">
                        {formatPrice(order.total, order.currency || "INR")}
                      </td>

                      {/* Payment Method & Payment Status */}
                      <td className="whitespace-nowrap px-3 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 border border-slate-200">
                            {order.payment_method === "cod" ? "Cash on Delivery" : "Online Demo"}
                          </span>
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase border ${
                              order.payment_status === "paid"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {order.payment_status}
                          </span>
                        </div>
                      </td>

                      {/* Order Status Badge */}
                      <td className="whitespace-nowrap px-3 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getStatusBadgeClass(
                            order.status
                          )}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${getStatusDotClass(
                              order.status
                            )}`}
                          />
                          <span className="capitalize">{order.status}</span>
                        </span>
                      </td>

                      {/* Placed At */}
                      <td className="whitespace-nowrap px-3 py-4 text-[11px] text-slate-500">
                        {formatDate(order.created_at)}
                      </td>

                      {/* View Action */}
                      <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                        >
                          <span>View</span>
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3 text-[11px] text-slate-500">
              <span>
                Showing <strong>{filteredOrders.length}</strong> of {orders.length} orders
              </span>
              <span>Sorted by latest order placement</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
