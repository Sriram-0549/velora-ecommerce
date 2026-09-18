"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { CustomerDetails, PaymentMethod, Order } from "@/types";
import { Button } from "@/components/common/Button";

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartCount, cartTotal, clearCart, isInitialized } = useCart();

  const [formData, setFormData] = useState<CustomerDetails>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Track order completion to prevent empty-cart guard from redirecting to /cart on success
  const orderCompletedRef = useRef(false);
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);

  // Delivery charge calculation (matches authoritative server policy in INR)
  // Free express shipping for orders >= ₹500, otherwise standard delivery charge of ₹50
  const freeShippingThreshold = 500;
  const deliveryCharge = cartTotal >= freeShippingThreshold || items.length === 0 ? 0 : 50;
  const finalTotal = cartTotal + deliveryCharge;

  // Empty cart protection: redirect back to /cart if empty once initialized (only if order has not been placed)
  useEffect(() => {
    if (!orderCompletedRef.current && isInitialized && items.length === 0) {
      router.replace("/cart");
    }
  }, [isInitialized, items.length, router]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation (10 digits)
    const cleanPhone = formData.phone.replace(/[\s\-+()]/g, "");
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = "Please enter a valid 10-digit mobile number (starts with 6-9)";
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Street address is required";
    } else if (formData.address.trim().length < 5) {
      newErrors.address = "Please provide complete street address";
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    // State validation
    if (!formData.state.trim()) {
      newErrors.state = "State / Province is required";
    }

    // Indian Pincode validation (6 digits, does not start with 0)
    const cleanPincode = formData.pincode.trim();
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!cleanPincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!pincodeRegex.test(cleanPincode)) {
      newErrors.pincode = "Enter a valid 6-digit Indian pincode (e.g. 110001, 560001)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      // Scroll to the first error
      const firstErrorField = document.querySelector("[data-error='true']");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (items.length === 0) {
      setSubmitError("Your shopping bag is empty. Please add pieces before placing an order.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Generate unique order ID format
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderId = `VEL-${randomSuffix}`;

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          customer: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            pincode: formData.pincode.trim(),
          },
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          paymentMethod,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg =
          data.message ||
          data.error ||
          `Order creation failed (Status ${response.status}). Please try again.`;
        setSubmitError(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // Compute estimated delivery for display
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 4);
      const formattedDelivery = deliveryDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const serverOrder = data.order || {};
      const confirmedOrder: Order = {
        id: serverOrder.id || orderId,
        customer: {
          name: serverOrder.customer_name || formData.name.trim(),
          email: serverOrder.customer_email || formData.email.trim(),
          phone: serverOrder.customer_phone || formData.phone.trim(),
          address: serverOrder.shipping_address || formData.address.trim(),
          city: serverOrder.city || formData.city.trim(),
          state: serverOrder.state || formData.state.trim(),
          pincode: serverOrder.pincode || formData.pincode.trim(),
        },
        items: [...items],
        subtotal: typeof serverOrder.subtotal === "number" ? serverOrder.subtotal : cartTotal,
        deliveryCharge:
          typeof serverOrder.delivery_charge === "number"
            ? serverOrder.delivery_charge
            : deliveryCharge,
        discount: typeof serverOrder.discount === "number" ? serverOrder.discount : 0,
        total: typeof serverOrder.total === "number" ? serverOrder.total : finalTotal,
        paymentMethod: (serverOrder.payment_method as PaymentMethod) || paymentMethod,
        placedAt: serverOrder.created_at || new Date().toISOString(),
        estimatedDelivery: serverOrder.estimated_delivery || formattedDelivery,
      };

      // 1. Save confirmed order information/order ID needed by success page
      try {
        localStorage.setItem("velora_latest_order", JSON.stringify(confirmedOrder));
      } catch (err) {
        console.error("Failed to save order to localStorage", err);
      }

      // 2. Mark checkout as completed to prevent empty-cart guard from redirecting to /cart
      orderCompletedRef.current = true;
      setIsOrderCompleted(true);

      // 3. Clear cart only after confirmed successful order creation
      clearCart();
      setIsSubmitting(false);

      // 4. Navigate to order-success page with confirmed order ID
      router.push(`/order-success?orderId=${confirmedOrder.id}`);
    } catch (err: unknown) {
      console.error("Error submitting order:", err);
      const message =
        err instanceof Error ? err.message : "Network error. Please check your connection and try again.";
      setSubmitError(message);
      setIsSubmitting(false);
    }
  };

  if (!isOrderCompleted && (!isInitialized || items.length === 0)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F8F9FC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Redirecting to Bag...
          </span>
        </div>
      </div>
    );
  }

  if (isOrderCompleted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F8F9FC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Confirming Order...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-24">
      {/* Header Banner & Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <nav className="flex items-center space-x-2 text-xs uppercase tracking-wider text-slate-500 mb-3">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-blue-600 transition-colors">
              Shopping Bag
            </Link>
            <span>/</span>
            <span className="font-bold text-[#111827]">Checkout</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111827]">
              Express Checkout
            </h1>
            <span className="text-xs font-semibold text-slate-500">
              Reviewing {cartCount} {cartCount === 1 ? "piece" : "pieces"}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <form onSubmit={handlePlaceOrder} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column (7 cols): Customer & Shipping Form + Payment Method */}
            <div className="lg:col-span-7 space-y-8">
              {/* Section 1: Customer & Shipping Address */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-8 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                    Step 1 of 2
                  </span>
                  <h2 className="text-lg font-bold text-[#111827]">
                    Shipping & Contact Information
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div data-error={!!errors.name}>
                    <label
                      htmlFor="name"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Eleanor Vance"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#111827] outline-none transition-all placeholder:text-slate-400 ${
                        errors.name
                          ? "border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>
                    )}
                  </div>

                  {/* Email & Phone (Grid 2 cols on tablet/desktop) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div data-error={!!errors.email}>
                      <label
                        htmlFor="email"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="eleanor@example.com"
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#111827] outline-none transition-all placeholder:text-slate-400 ${
                          errors.email
                            ? "border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>
                      )}
                    </div>

                    <div data-error={!!errors.phone}>
                      <label
                        htmlFor="phone"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                      >
                        Phone Number (10-Digit) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="9876543210"
                        maxLength={12}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#111827] outline-none transition-all placeholder:text-slate-400 ${
                          errors.phone
                            ? "border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Street Address */}
                  <div data-error={!!errors.address}>
                    <label
                      htmlFor="address"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                    >
                      Street Address & Apartment <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Suite 402, Highline Residences, MG Road"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#111827] outline-none transition-all placeholder:text-slate-400 ${
                        errors.address
                          ? "border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      }`}
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{errors.address}</p>
                    )}
                  </div>

                  {/* City, State, Pincode (Grid 3 cols on tablet/desktop) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div data-error={!!errors.city}>
                      <label
                        htmlFor="city"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                      >
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Mumbai"
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#111827] outline-none transition-all placeholder:text-slate-400 ${
                          errors.city
                            ? "border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        }`}
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs text-red-500 font-medium">{errors.city}</p>
                      )}
                    </div>

                    <div data-error={!!errors.state}>
                      <label
                        htmlFor="state"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                      >
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Maharashtra"
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#111827] outline-none transition-all placeholder:text-slate-400 ${
                          errors.state
                            ? "border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        }`}
                      />
                      {errors.state && (
                        <p className="mt-1 text-xs text-red-500 font-medium">{errors.state}</p>
                      )}
                    </div>

                    <div data-error={!!errors.pincode}>
                      <label
                        htmlFor="pincode"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                      >
                        Pincode (6-Digit) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="400001"
                        maxLength={6}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#111827] outline-none transition-all placeholder:text-slate-400 ${
                          errors.pincode
                            ? "border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        }`}
                      />
                      {errors.pincode && (
                        <p className="mt-1 text-xs text-red-500 font-medium">{errors.pincode}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Payment Method */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-8 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                    Step 2 of 2
                  </span>
                  <h2 className="text-lg font-bold text-[#111827]">
                    Payment Method
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cash on Delivery Option */}
                  <label
                    className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition-all ${
                      paymentMethod === "cod"
                        ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-600"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-600"
                        />
                        <span className="text-sm font-bold text-[#111827]">
                          Cash on Delivery
                        </span>
                      </div>
                      <span className="text-xs">💵</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 pl-7">
                      Pay conveniently in cash or UPI at your doorstep upon parcel arrival.
                    </p>
                  </label>

                  {/* Online Payment (Demo) Option */}
                  <label
                    className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition-all ${
                      paymentMethod === "online_demo"
                        ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-600"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="online_demo"
                          checked={paymentMethod === "online_demo"}
                          onChange={() => setPaymentMethod("online_demo")}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-600"
                        />
                        <div>
                          <span className="text-sm font-bold text-[#111827]">
                            Online Payment
                          </span>
                          <span className="ml-2 rounded bg-blue-100 border border-blue-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700">
                            Demo
                          </span>
                        </div>
                      </div>
                      <span className="text-xs">💳</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 pl-7">
                      Instant simulated verification (Cards, UPI, NetBanking). No real charge.
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Order Summary Sidebar */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider text-[#111827]">
                    Order Summary
                  </h2>
                  <Link
                    href="/cart"
                    className="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    Edit Bag
                  </Link>
                </div>

                {/* Itemized List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 py-2">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex gap-3 py-3">
                      <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden rounded-md bg-slate-100 border border-slate-200">
                        <Image
                          src={product.image || product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="text-xs font-semibold line-clamp-1 text-[#111827]">
                            {product.name}
                          </h3>
                          <span className="text-[10px] uppercase text-slate-400">
                            Qty: {quantity} • {product.category}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-[#111827]">
                          {formatPrice(product.price * quantity, product.currency)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals & Delivery breakdown */}
                <div className="space-y-3 py-4 text-xs font-medium text-slate-600 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-[#111827]">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <span>Delivery Charge</span>
                      {deliveryCharge === 0 && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700">
                          FREE
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-[#111827]">
                      {deliveryCharge === 0 ? "Free" : formatPrice(deliveryCharge, items[0]?.product.currency || "INR")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Selected Payment</span>
                    <span className="font-semibold text-[#111827]">
                      {paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment (Demo)"}
                    </span>
                  </div>
                </div>

                {/* Final Total */}
                <div className="py-4 border-t border-slate-100">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-sm font-bold uppercase tracking-wider text-[#111827]">
                        Final Total
                      </span>
                      <p className="text-[11px] text-slate-400">All duties and local taxes included</p>
                    </div>
                    <span className="text-2xl font-black text-[#111827]">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Error Banner */}
                {submitError && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
                    <div className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 font-bold text-red-600">✕</span>
                      <div>
                        <p className="font-bold">Order Could Not Be Placed</p>
                        <p className="mt-1 leading-relaxed">{submitError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit / Place Order Button */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-blue-600 text-white hover:bg-blue-700 font-bold uppercase tracking-wider text-xs rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      <span>Processing Order...</span>
                    </span>
                  ) : (
                    `Place Order • ${formatPrice(finalTotal)}`
                  )}
                </Button>

                {/* Value guarantees */}
                <div className="mt-6 space-y-2 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>30-Day doorstep returns guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>100% Genuine designer products</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Contact concierge support anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
