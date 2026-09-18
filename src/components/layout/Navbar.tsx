"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Monitor scroll for subtle shadow & height transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <>
      {/* Top Notification Announcement Bar */}
      <div className="bg-[#111827] px-3 py-1.5 sm:px-4 sm:py-2 text-center text-[10px] sm:text-xs font-medium tracking-wider text-slate-200 overflow-hidden">
        <span className="truncate block sm:inline">
          COMPLIMENTARY WORLDWIDE DELIVERY ON ORDERS OVER $100 • CODE:{" "}
          <span className="font-semibold text-pink-400">VELORA15</span>
        </span>
      </div>

      {/* Sticky Main Navigation */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md"
            : "border-b border-slate-100 bg-white/90 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>

          {/* Brand Logo / Wordmark */}
          <div className="flex items-center">
            <Link
              href="/"
              className="group flex items-center space-x-1.5 sm:space-x-2 text-xl sm:text-2xl font-black tracking-[0.22em] sm:tracking-[0.28em] text-[#111827] transition-colors hover:text-blue-600"
            >
              <span>VELORA</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-10 text-xs font-semibold uppercase tracking-widest text-slate-600">
            {siteConfig.mainNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`relative py-1 transition-colors hover:text-blue-600 ${
                    isActive
                      ? "text-blue-600 font-bold after:w-full"
                      : "after:w-0 hover:after:w-full"
                  } after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-blue-600 after:transition-all`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons (Search, Account, Cart) */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Search Icon / Toggle */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className={`rounded-full p-2 sm:p-2.5 transition-colors cursor-pointer ${
                searchOpen
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-700 hover:bg-slate-100 hover:text-blue-600"
              }`}
              aria-label="Search catalogue"
              title="Search products"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>

            {/* Account Icon Link */}
            <Link
              href="/account"
              className={`rounded-full p-2 sm:p-2.5 transition-colors cursor-pointer ${
                pathname === "/account"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-700 hover:bg-slate-100 hover:text-blue-600"
              }`}
              aria-label="Customer Account and Orders"
              title="Customer Account"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </Link>

            {/* Cart Icon Link */}
            <Link
              href="/cart"
              className={`relative rounded-full p-2 sm:p-2.5 transition-colors cursor-pointer ${
                pathname === "/cart"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-700 hover:bg-slate-100 hover:text-blue-600"
              }`}
              aria-label={`View Shopping Bag (${cartCount} items)`}
              title="Shopping Bag"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.19-.578-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-xs transition-transform scale-100">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="border-t border-slate-200 bg-[#EFF6FF] px-4 py-3 animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="mx-auto flex max-w-2xl items-center gap-3">
              <svg className="h-5 w-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search coats, tees, accessories... (press Enter)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-[#111827] outline-none placeholder:text-slate-400"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-blue-600 cursor-pointer shrink-0"
              >
                Close
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Drawer & Backdrop */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 top-16 sm:top-18 bg-slate-900/30 z-40 backdrop-blur-2xs lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer Content */}
            <div className="relative z-50 border-b border-slate-200 bg-white px-5 py-6 lg:hidden shadow-xl animate-fadeIn">
              <div className="flex flex-col space-y-2 text-sm font-semibold uppercase tracking-widest text-slate-700">
                {siteConfig.mainNav.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2 px-1 transition-colors hover:text-blue-600 ${
                      pathname === item.href ? "text-blue-600 font-bold" : ""
                    }`}
                  >
                    {item.title}
                  </Link>
                ))}

                {/* Mobile Quick Category Jump */}
                <div className="py-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Quick Categories
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: "Men", href: "/products?category=Men" },
                      { name: "Women", href: "/products?category=Women" },
                      { name: "Accessories", href: "/products?category=Accessories" },
                      { name: "New Arrivals", href: "/products?category=New%20Arrivals" },
                    ].map((cat) => (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-1 flex items-center justify-between transition-colors hover:text-blue-600 border-t border-slate-100 pt-3"
                >
                  <span>My Account</span>
                  <span className="text-[11px] font-normal text-blue-600 lowercase tracking-normal">
                    orders & perks →
                  </span>
                </Link>

                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-1 flex items-center justify-between transition-colors hover:text-blue-600 border-t border-slate-100"
                >
                  <span>Shopping Bag</span>
                  {cartCount > 0 ? (
                    <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">
                      {cartCount}
                    </span>
                  ) : (
                    <span className="text-[11px] font-normal text-slate-400 lowercase tracking-normal">
                      empty
                    </span>
                  )}
                </Link>
              </div>
              <div className="mt-5 border-t border-slate-200 pt-4 flex items-center justify-between text-xs tracking-wider text-slate-500">
                <span>Currency: USD ($)</span>
                <span>concierge@velora.com</span>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
}
