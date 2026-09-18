"use client";

import React, { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const urlOrderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadOrder() {
      // 1. If orderId is present in URL search params, attempt to fetch authoritative record from GET /api/orders/[id]
      if (urlOrderId) {
        try {
          const res = await fetch(`/api/orders/${urlOrderId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          });

          if (res.ok) {
            const apiOrder = await res.json();
            if (!isCancelled && apiOrder && apiOrder.id) {
              const mappedOrder: Order = {
                id: apiOrder.id,
                customer: {
                  name: apiOrder.customer_name || "",
                  email: apiOrder.customer_email || "",
                  phone: apiOrder.customer_phone || "",
                  address: apiOrder.shipping_address || "",
                  city: apiOrder.city || "",
                  state: apiOrder.state || "",
                  pincode: apiOrder.pincode || "",
                },
                items: Array.isArray(apiOrder.items)
                  ? apiOrder.items.map((i: any) => ({
                      product: {
                        id: String(i.product_id),
                        name: i.product_name,
                        price: Number(i.product_price) || 0,
                        currency: apiOrder.currency || "INR",
                        image: i.product_image || DEFAULT_FALLBACK_IMAGE,
                        imageUrl: i.product_image || DEFAULT_FALLBACK_IMAGE,
                        category: "Velora Atelier",
                        description: "",
                        rating: 5,
                        reviewCount: 1,
                        stock: 10,
                        inStock: true,
                      },
                      quantity: i.quantity || 1,
                    }))
                  : [],
                subtotal: Number(apiOrder.subtotal) || 0,
                deliveryCharge: Number(apiOrder.delivery_charge) || 0,
                discount: Number(apiOrder.discount) || 0,
                total: Number(apiOrder.total) || 0,
                paymentMethod: apiOrder.payment_method || "cod",
                placedAt: apiOrder.created_at || new Date().toISOString(),
                estimatedDelivery: apiOrder.estimated_delivery || "3 to 5 business days",
              };
              setOrder(mappedOrder);
              setIsLoaded(true);
              return;
            }
          }
        } catch (apiErr) {
          console.warn("Failed to fetch order from API, checking localStorage fallback:", apiErr);
        }
      }

      // 2. Fallback to localStorage
      try {
        const stored = localStorage.getItem("velora_latest_order");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!urlOrderId || parsed.id === urlOrderId) {
            if (!isCancelled) {
              setOrder(parsed);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load order from localStorage", err);
      } finally {
        if (!isCancelled) {
          setIsLoaded(true);
        }
      }
    }

    loadOrder();

    return () => {
      isCancelled = true;
    };
  }, [urlOrderId]);

  const handleCopyOrderId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F8F9FC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Fetching Order Confirmation...
          </span>
        </div>
      </div>
    );
  }

  // Fallback if no order found
  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-[#F8F9FC]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#111827]">
          No Recent Order Found
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          {urlOrderId
            ? `Order #${urlOrderId} could not be located in our records.`
            : "It seems you have not placed an order in this session or your history has expired."}
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-24">
      {/* Top Banner */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 text-center">
          {/* Animated Success Badge */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-xs animate-scaleIn mb-4">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-600">
            Order Confirmed
          </span>

          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#111827]">
            Thank You for Your Order
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
            We have received your order and our atelier is preparing your pieces with meticulous care.
          </p>

          {/* Order ID Pill */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs">
            <span className="text-slate-500">Order ID:</span>
            <span className="font-bold text-[#111827] tracking-wider font-mono">
              {order.id}
            </span>
            <button
              type="button"
              onClick={handleCopyOrderId}
              className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Estimated Delivery Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-lg">
              🚚
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Delivery Schedule
              </span>
              <h3 className="text-sm font-bold text-[#111827]">
                Estimated Delivery: 3 to 5 Business Days
              </h3>
              <p className="text-xs text-slate-500">
                Expected parcel arrival by <strong className="text-[#111827]">{order.estimatedDelivery}</strong>
              </p>
            </div>
          </div>

          <div className="self-end sm:self-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Dispatching Soon
            </span>
          </div>
        </div>

        {/* Customer & Delivery Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Address Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3 mb-4">
              Shipping Destination
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              <p className="font-bold text-sm text-[#111827]">
                {order.customer.name}
              </p>
              <p>{order.customer.address}</p>
              <p>
                {order.customer.city}, {order.customer.state} —{" "}
                <strong className="text-[#111827]">{order.customer.pincode}</strong>
              </p>
              <div className="pt-2 text-slate-500 space-y-0.5">
                <p>Phone: {order.customer.phone}</p>
                <p>Email: {order.customer.email}</p>
              </div>
            </div>
          </div>

          {/* Payment & Status Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3 mb-4">
              Payment & Invoicing
            </h3>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-bold text-[#111827]">
                  {order.paymentMethod === "cod" ? "Cash on Delivery (COD)" : "Online Payment (Demo)"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Status:</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-800">
                  {order.paymentMethod === "cod" ? "Pending on Delivery" : "Authorized (Demo)"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Order Placed:</span>
                <span className="font-medium text-[#111827]">
                  {new Date(order.placedAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-slate-500">Receipt Sent To:</span>
                <span className="font-medium text-[#111827] truncate max-w-[180px]">
                  {order.customer.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Products Table */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#111827]">
              Items in this Order ({order.items.reduce((s, i) => s + i.quantity, 0)})
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {order.items.map(({ product, quantity }) => (
              <div key={product.id} className="p-4 sm:p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-18 w-14 sm:h-20 sm:w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                    <Image
                      src={product.image || product.imageUrl || DEFAULT_FALLBACK_IMAGE}
                      alt={product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {product.category}
                    </span>
                    <h4 className="text-sm font-semibold text-[#111827] line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Quantity: <strong className="text-[#111827]">{quantity}</strong> ×{" "}
                      {formatPrice(product.price, product.currency)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-[#111827]">
                    {formatPrice(product.price * quantity, product.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals Footer */}
          <div className="border-t border-slate-200 bg-slate-50/50 p-6 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-[#111827]">
                {formatPrice(order.subtotal, order.items[0]?.product.currency || "INR")}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Charge</span>
              <span className="font-semibold text-[#111827]">
                {order.deliveryCharge === 0 ? "Free" : formatPrice(order.deliveryCharge, order.items[0]?.product.currency || "INR")}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-black text-[#111827]">
              <span>Total Paid / Due</span>
              <span>{formatPrice(order.total, order.items[0]?.product.currency || "INR")}</span>
            </div>
          </div>
        </div>

        {/* Next Actions & Continue Shopping Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link
              href="/products"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 transition-colors shadow-md"
            >
              Continue Shopping
            </Link>
            <Link
              href="/account"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              View in My Account →
            </Link>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Need assistance with this order?</span>
            <Link href="/#about" className="font-semibold underline text-blue-600 hover:text-blue-700">
              Contact Concierge
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-[#F8F9FC]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Loading Order Confirmation...
            </span>
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
