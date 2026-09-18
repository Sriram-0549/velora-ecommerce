"use client";

import React, { useState } from "react";
import { Button } from "@/components/common/Button";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("success");
    setMessage("Welcome to VELORA VIP. Your 15% code VELORA15 is now activated.");
    setEmail("");
  };

  return (
    <section className="py-16 sm:py-24 bg-[#EFF6FF]/60 border-t border-slate-200">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
          The Inner Circle
        </span>

        <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#111827]">
          Join the VELORA Studio
        </h2>

        <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 max-w-xl mx-auto">
          Subscribe to receive private capsule drops, lookbook previews, and an exclusive 15% welcome reduction applied directly to your first order.
        </p>

        {/* Subscription Form */}
        <form onSubmit={handleSubmit} className="mt-8 sm:mt-10 max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              placeholder="Enter your email address"
              aria-label="Email address for newsletter"
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3.5 text-sm text-[#111827] outline-none transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
              required
            />
            <Button
              type="submit"
              size="lg"
              className="bg-blue-600 text-white hover:bg-blue-700 px-6 tracking-wider uppercase text-xs font-bold rounded-lg shadow-sm whitespace-nowrap cursor-pointer"
            >
              Subscribe
            </Button>
          </div>

          {/* Feedback messages */}
          {status === "success" && (
            <p className="mt-3 text-xs font-semibold text-emerald-600">
              {message}
            </p>
          )}
          {status === "error" && (
            <p className="mt-3 text-xs font-semibold text-red-600">
              {message}
            </p>
          )}

          <p className="mt-4 text-[11px] text-slate-500">
            By signing up, you agree to our Privacy Policy. No spam, unsubscribe anytime in 1-click.
          </p>
        </form>
      </div>
    </section>
  );
}
