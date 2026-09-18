import { NavItem } from "@/types";

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  mainNav: NavItem[];
  social: {
    instagram: string;
    tiktok: string;
    pinterest: string;
    twitter: string;
  };
  contact: {
    email: string;
    phone: string;
    hours: string;
  };
}

export const siteConfig: SiteConfig = {
  name: "VELORA",
  tagline: "Modern Wardrobe Essentials & Contemporary Lifestyle",
  description:
    "Curated fashion and minimalist lifestyle pieces crafted for modern young adults. Discover timeless tailoring, sustainable fabrics, and effortless silhouettes.",
  url: "https://velorastudio.com",
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Shop", href: "/products" },
    { title: "Categories", href: "/#categories" },
    { title: "About", href: "/#about" },
  ],
  social: {
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
    pinterest: "https://pinterest.com",
    twitter: "https://twitter.com",
  },
  contact: {
    email: "concierge@velorastudio.com",
    phone: "+1 (800) 582-7491",
    hours: "Mon - Fri, 9am - 6pm EST",
  },
};
