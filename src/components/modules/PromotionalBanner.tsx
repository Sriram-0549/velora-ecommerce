import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/common/Button";

export function PromotionalBanner() {
  return (
    <section id="promo" className="py-12 sm:py-16 bg-[#F8F9FC]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#111827] text-white shadow-2xl border border-slate-800">
          {/* Background Fashion Imagery with Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80"
              alt="VELORA Seasonal Capsule Drop"
              fill
              sizes="100vw"
              className="object-cover object-center opacity-40 filter contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/85 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 p-8 sm:p-14 lg:p-20">
            <div className="lg:col-span-8 space-y-4 sm:space-y-6">
              <span className="inline-flex items-center rounded-full bg-pink-500/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-pink-300 backdrop-blur-md border border-pink-500/30">
                Limited Edition Capsule
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                The Contemporary Series.
                <br />
                <span className="font-serif italic font-normal text-slate-300">
                  Refined Simplicity
                </span>{" "}
                for Autumn.
              </h2>

              <p className="max-w-xl text-sm sm:text-base leading-relaxed text-slate-300">
                An exclusive studio edit of 12 transitional garments designed to be worn interchangeably. Crafted in numbered runs to maintain exclusivity and prevent excess.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/products">
                  <Button
                    size="lg"
                    className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3.5 tracking-wider uppercase text-xs font-bold rounded-lg shadow-md"
                  >
                    Discover The Capsule
                  </Button>
                </Link>
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <span className="font-bold text-white">CODE:</span>
                  <span className="rounded bg-pink-500/30 border border-pink-400/40 px-2 py-1 font-mono tracking-widest text-pink-300 font-semibold">
                    VELORA15
                  </span>
                  <span className="text-slate-400">for 15% off first order</span>
                </div>
              </div>
            </div>

            {/* Accent Visual Perk */}
            <div className="hidden lg:flex lg:col-span-4 justify-end">
              <div className="rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-md max-w-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-neutral-400">
                    Release
                  </span>
                  <span className="text-xs font-bold text-emerald-400">Live Now</span>
                </div>
                <p className="text-sm font-medium text-neutral-200">
                  "The cleanest silhouette we have seen all season." — Vogue Fashion Edit
                </p>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
                  <span>Numbered Edition</span>
                  <span className="font-bold text-white">1 of 500</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
