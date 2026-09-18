import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#111827] text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Column 1: Brand & Ethos */}
          <div className="space-y-4 lg:col-span-2">
            <Link
              href="/"
              className="text-2xl font-black tracking-[0.25em] text-white transition-opacity hover:opacity-80 inline-block"
            >
              VELORA
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              Contemporary wardrobe essentials sculpted for young adults. Designed with architectural precision, certified organic materials, and enduring minimalism.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 text-xs tracking-wider text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                Global Studios • NYC / London / Tokyo
              </span>
            </div>
          </div>

          {/* Column 2: Navigation / Collections */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">
              Navigation
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/products" className="transition-colors hover:text-white">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/products" className="transition-colors hover:text-white">
                  Women's Studio
                </Link>
              </li>
              <li>
                <Link href="/products" className="transition-colors hover:text-white">
                  Men's Atelier
                </Link>
              </li>
              <li>
                <Link href="/products" className="transition-colors hover:text-white">
                  Curated Accessories
                </Link>
              </li>
              <li>
                <Link href="/products" className="transition-colors hover:text-white">
                  Limited Capsule Drops
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">
              Customer Support
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/account" className="transition-colors hover:text-white">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/account" className="transition-colors hover:text-white">
                  Customer Account
                </Link>
              </li>
              <li>
                <span className="cursor-pointer transition-colors hover:text-white">
                  Shipping & Customs
                </span>
              </li>
              <li>
                <span className="cursor-pointer transition-colors hover:text-white">
                  Returns & Exchanges
                </span>
              </li>
              <li>
                <span className="cursor-pointer transition-colors hover:text-white">
                  Garment Care Guide
                </span>
              </li>
              <li>
                <span className="cursor-pointer transition-colors hover:text-white">
                  Concierge FAQs
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Social & Policies */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">
              Connect & Social
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-white"
                >
                  Instagram <span className="text-xs text-neutral-600">↗</span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.social.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-white"
                >
                  TikTok <span className="text-xs text-neutral-600">↗</span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.social.pinterest}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-white"
                >
                  Pinterest <span className="text-xs text-neutral-600">↗</span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.social.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-white"
                >
                  Twitter (X) <span className="text-xs text-neutral-600">↗</span>
                </a>
              </li>
            </ul>

            <h3 className="mt-6 text-xs font-bold uppercase tracking-widest text-white">
              Legal & Policies
            </h3>
            <ul className="mt-2.5 space-y-1.5 text-xs text-slate-500">
              <li>
                <span className="cursor-pointer hover:text-slate-300">Privacy Policy</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-slate-300">Terms of Service</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-slate-300">Sustainability Disclosure</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Locale */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {siteConfig.name} Studio Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span>Currency: USD ($)</span>
            <span>English (US)</span>
            <span>Designed with Architectural Precision</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
