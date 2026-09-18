import React from "react";
import Image from "next/image";
import Link from "next/link";
import { mockCategories } from "@/data/mockData";

export function FeaturedCategories() {
  return (
    <section id="categories" className="py-16 sm:py-24 bg-[#F8F9FC]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Curated Wardrobe
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#111827]">
              Featured Categories
            </h2>
          </div>
          <Link
            href="/products"
            className="mt-3 sm:mt-0 inline-flex items-center text-xs font-bold uppercase tracking-widest text-slate-700 hover:text-blue-600 transition-colors"
          >
            Explore All Collections <span className="ml-1 text-sm">→</span>
          </Link>
        </div>

        {/* Category Grid: 1 col on mobile, 2 col on tablet, 4 col on desktop */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mockCategories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group relative flex h-72 sm:h-96 flex-col justify-end overflow-hidden rounded-2xl bg-slate-100 p-5 sm:p-6 shadow-sm border border-slate-200 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Category Background Image */}
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
              />

              {/* Gradient Overlay for Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/30 to-transparent transition-opacity group-hover:opacity-90"></div>

              {/* Category Card Content */}
              <div className="relative z-10 space-y-1.5 text-white">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-300">
                  {category.itemCount} Styles
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{category.name}</h3>
                <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed opacity-90 sm:opacity-0 transition-opacity duration-300 sm:group-hover:opacity-100">
                  {category.description}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-white group-hover:underline">
                    Discover Collection <span className="ml-1">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
