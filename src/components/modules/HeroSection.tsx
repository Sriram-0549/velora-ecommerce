import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/common/Button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#EFF6FF]/60 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:min-h-[680px] items-center gap-8 py-12 lg:py-0">
          {/* Text Content */}
          <div className="lg:col-span-6 z-10 flex flex-col justify-center space-y-6 text-left">
            <div className="inline-flex items-center gap-2">
              <span className="h-px w-8 bg-blue-600"></span>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                Autumn / Winter 2026 Studio Drop
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#111827] leading-[1.08]">
              Modern Aesthetics.
              <br />
              <span className="font-serif italic font-normal text-slate-700">
                Effortless
              </span>{" "}
              Attitude.
            </h1>

            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-slate-600">
              Sculpted silhouettes, heavyweight organic cottons, and refined tailoring designed for the rhythm of modern city life. Built to stand the test of time.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/products">
                <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3.5 tracking-wider uppercase text-xs font-bold rounded-lg shadow-sm">
                  Shop Now
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="border-slate-300 bg-white text-slate-800 hover:bg-slate-50 px-8 py-3.5 tracking-wider uppercase text-xs font-bold rounded-lg">
                  Explore Categories
                </Button>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-6 mt-4">
              <div>
                <span className="block text-xl font-bold text-[#111827]">100%</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Ethical Cotton</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-[#111827]">48hr</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Priority Dispatch</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-[#111827]">4.9/5</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Customer Rating</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Imagery */}
          <div className="lg:col-span-6 relative w-full h-[460px] sm:h-[560px] lg:h-[640px] flex items-center justify-center">
            {/* Main Feature Image */}
            <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85"
                alt="VELORA Autumn/Winter Editorial Collection"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top filter contrast-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent"></div>

              {/* Floating Editorial Badge */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-xl bg-white/95 p-4 backdrop-blur-md shadow-lg border border-slate-200">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Featured Look
                  </span>
                  <p className="text-sm font-semibold text-[#111827]">
                    Minimalist Wool Coat & Pleated Trousers
                  </p>
                </div>
                <Link
                  href="/products/prod-1"
                  className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-blue-700"
                >
                  View Piece
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
