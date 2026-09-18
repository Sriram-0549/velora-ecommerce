"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { AdminOrder, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import AdminNav from "@/components/admin/AdminNav";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const ALLOWED_STATUSES: OrderStatus[] = [
  "processing",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80";

export default function AdminOrderDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status update state
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("processing");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 404) {
          throw new Error(`Order #${orderId} was not found in database.`);
        }
        throw new Error(errData.message || errData.error || `HTTP ${res.status}`);
      }

      const data: AdminOrder = await res.json();
      setOrder(data);
      setSelectedStatus(data.status);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load order details";
      console.error("fetchOrderDetail error:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // Handle status update submission via PUT /api/orders/[id]
  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order || newStatus === order.status) return;

    try {
      setIsUpdatingStatus(true);
      setStatusMessage(null);

      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const resData = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(resData.message || resData.error || `Update failed (HTTP ${res.status})`);
      }

      // Update state with updated order
      if (resData.order) {
        setOrder((prev) => (prev ? { ...prev, ...resData.order } : null));
        setSelectedStatus(resData.order.status);
      } else {
        setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
        setSelectedStatus(newStatus);
      }

      setStatusMessage({
        type: "success",
        text: `Order status successfully updated to "${newStatus}".`,
      });

      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update order status";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "—";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
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

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-24">
      {/* Shared Navigation */}
      <AdminNav activeTab="orders" />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Orders</span>
          </Link>
        </div>

        {/* Status Toast Banner */}
        {statusMessage && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-2xl px-5 py-4 text-xs font-bold transition-all shadow-sm ${
              statusMessage.type === "success"
                ? "border border-emerald-300 bg-emerald-50 text-emerald-900"
                : "border border-red-300 bg-red-50 text-red-900"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                statusMessage.type === "success" ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-6">
            <div className="h-32 w-full animate-pulse rounded-2xl border border-slate-200 bg-white p-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white p-6 md:col-span-2" />
              <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white p-6" />
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center">
            <h2 className="text-base font-bold text-red-800">
              Unable to Load Order
            </h2>
            <p className="mt-1 text-xs text-red-600">{error}</p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <Link
                href="/admin/orders"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-800 hover:bg-slate-50"
              >
                Return to Orders
              </Link>
              <button
                type="button"
                onClick={fetchOrderDetail}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Order Details Body */}
        {!loading && !error && order && (
          <div className="space-y-8">
            {/* Top Order Header Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-8 shadow-xs">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                      Order Reference
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotClass(order.status)}`} />
                      <span className="capitalize">{order.status}</span>
                    </span>
                  </div>
                  <h1 className="mt-1 text-2xl sm:text-3xl font-mono font-black text-[#111827]">
                    {order.id}
                  </h1>
                  <p className="mt-1 text-xs text-slate-500">
                    Placed on {formatDate(order.created_at)}
                    {order.updated_at && order.updated_at !== order.created_at && (
                      <span className="ml-2 font-mono">
                        (Updated: {formatDate(order.updated_at)})
                      </span>
                    )}
                  </p>
                </div>

                {/* Status Update Control */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <div className="flex flex-col">
                    <label
                      htmlFor="order-status-select"
                      className="text-[10px] font-bold uppercase tracking-widest text-slate-500"
                    >
                      Order Fulfillment Status
                    </label>
                    <select
                      id="order-status-select"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                      disabled={isUpdatingStatus}
                      className="mt-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-[#111827] outline-none focus:border-blue-600 cursor-pointer"
                    >
                      {ALLOWED_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st.charAt(0).toUpperCase() + st.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedStatus)}
                    disabled={isUpdatingStatus || selectedStatus === order.status}
                    className="w-full sm:w-auto mt-2 sm:mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-blue-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all text-center"
                  >
                    {isUpdatingStatus ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Updating...</span>
                      </span>
                    ) : (
                      "Apply Status"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 2-Column Details Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column (2 Cols): Line Items & Totals */}
              <div className="lg:col-span-2 space-y-8">
                {/* Purchased Items Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <div className="border-b border-slate-100 px-6 py-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Purchased Items ({order.items?.length || 0})
                    </h2>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-5 sm:px-6">
                          {/* Item Thumbnail */}
                          <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                            <Image
                              src={item.product_image || DEFAULT_FALLBACK_IMAGE}
                              alt={item.product_name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>

                          {/* Item Info */}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-[#111827] text-xs sm:text-sm">
                              {item.product_name}
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-500 font-mono">
                              Unit Price: {formatPrice(item.product_price, order.currency || "INR")} &times; {item.quantity} unit{item.quantity > 1 ? "s" : ""}
                            </p>
                          </div>

                          {/* Item Line Total */}
                          <div className="text-right">
                            <span className="font-mono font-black text-[#111827] text-xs sm:text-sm">
                              {formatPrice(item.item_total, order.currency || "INR")}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No line item records attached to this order.
                      </div>
                    )}
                  </div>

                  {/* Financial Totals Breakdown */}
                  <div className="border-t border-slate-100 bg-slate-50/70 p-6 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-mono font-medium">
                        {formatPrice(order.subtotal, order.currency || "INR")}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Delivery Charge</span>
                      <span className="font-mono font-medium">
                        {Number(order.delivery_charge) === 0 ? (
                          <span className="text-emerald-600 font-bold">FREE</span>
                        ) : (
                          formatPrice(order.delivery_charge, order.currency || "INR")
                        )}
                      </span>
                    </div>
                    {Number(order.discount) > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount Applied</span>
                        <span className="font-mono font-medium">
                          -{formatPrice(order.discount, order.currency || "INR")}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-slate-200 pt-3 flex justify-between text-sm sm:text-base font-black text-[#111827]">
                      <span>Grand Total</span>
                      <span className="font-mono">
                        {formatPrice(order.total, order.currency || "INR")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (1 Col): Customer, Shipping, Payment Profiles */}
              <div className="space-y-6">
                {/* Customer Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Customer Details
                    </h2>
                  </div>

                  <div className="mt-4 space-y-2.5 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Name</span>
                      <p className="font-bold text-[#111827] text-sm">
                        {order.customer_name}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Email</span>
                      <a
                        href={`mailto:${order.customer_email}`}
                        className="text-slate-800 hover:text-blue-600 hover:underline font-medium"
                      >
                        {order.customer_email}
                      </a>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Phone</span>
                      <a
                        href={`tel:${order.customer_phone}`}
                        className="text-slate-800 hover:text-blue-600 hover:underline font-mono"
                      >
                        {order.customer_phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Shipping Destination Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Shipping Address
                    </h2>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-700">
                    <p className="leading-relaxed font-medium">
                      {order.shipping_address}
                    </p>
                    <p className="font-semibold">
                      {order.city}, {order.state} - <span className="font-mono">{order.pincode}</span>
                    </p>
                    {order.estimated_delivery && (
                      <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                        <span>Estimated Delivery: </span>
                        <strong className="text-[#111827] font-semibold">
                          {order.estimated_delivery}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Payment Profile
                    </h2>
                  </div>

                  <div className="mt-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Method</span>
                      <span className="font-bold text-[#111827] uppercase">
                        {order.payment_method === "cod" ? "Cash on Delivery" : "Online Demo"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Payment Status</span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${
                          order.payment_status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
