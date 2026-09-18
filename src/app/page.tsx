import React from "react";
import { HeroSection } from "@/components/modules/HeroSection";
import { FeaturedCategories } from "@/components/modules/FeaturedCategories";
import { FeaturedProducts } from "@/components/modules/FeaturedProducts";
import { PromotionalBanner } from "@/components/modules/PromotionalBanner";
import { WhyVelora } from "@/components/modules/WhyVelora";
import { NewsletterSection } from "@/components/modules/NewsletterSection";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* 2. Hero Section */}
      <HeroSection />

      {/* 3. Featured Categories */}
      <FeaturedCategories />

      {/* 4. Featured Products (Interactive Filtering & Quick Add) */}
      <FeaturedProducts />

      {/* 5. Promotional Banner */}
      <PromotionalBanner />

      {/* 6. Why VELORA */}
      <WhyVelora />

      {/* 7. Newsletter Section */}
      <NewsletterSection />
    </div>
  );
}
