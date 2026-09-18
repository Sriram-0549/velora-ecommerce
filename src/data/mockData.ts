import { Product, Category, ValueProp } from "@/types";

export const mockCategories: Category[] = [
  {
    id: "cat-women",
    name: "Women",
    slug: "women",
    description: "Contemporary silhouettes, elevated basics, and modern tailoring.",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    itemCount: 142,
  },
  {
    id: "cat-men",
    name: "Men",
    slug: "men",
    description: "Architectural cuts, relaxed outerwear, and everyday refined essentials.",
    imageUrl: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
    itemCount: 118,
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    description: "Minimalist leather goods, timeless eyewear, and sculpted jewelry.",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    itemCount: 86,
  },
  {
    id: "cat-new-arrivals",
    name: "New Arrivals",
    slug: "new-arrivals",
    description: "Fresh drops from our Autumn/Winter studio capsule release.",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    itemCount: 45,
  },
];

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "Oversized Wool Blend Trench Coat",
    description: "A relaxed, structured double-breasted coat crafted from premium recycled wool blend with storm flap detailing.",
    price: 245,
    originalPrice: 290,
    currency: "USD",
    category: "Women",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewCount: 128,
    stock: 14,
    inStock: true,
    tag: "Trending",
    isFeatured: true,
    details: {
      material: "70% Recycled Wool, 30% Polyamide",
      fit: "Relaxed, oversized cut designed for easy layering",
      care: "Dry clean only",
      origin: "Ethically tailored in Porto, Portugal",
    },
  },
  {
    id: "prod-2",
    name: "Sculptural Heavyweight Hoodie",
    description: "Dense 480 GSM French terry cotton with a boxy drape, dropped shoulders, and seamless kangaroo pocket.",
    price: 110,
    currency: "USD",
    category: "Men",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviewCount: 94,
    stock: 22,
    inStock: true,
    tag: "Bestseller",
    isFeatured: true,
    details: {
      material: "100% GOTS Certified Organic Cotton (480 GSM)",
      fit: "Boxy, relaxed modern streetwear silhouette",
      care: "Machine wash cold inside out, hang dry",
      origin: "Crafted in Izmir, Turkey",
    },
  },
  {
    id: "prod-3",
    name: "Tailored Pleated Wide Trousers",
    description: "Fluid wool-touch drape featuring clean front pleats, slant pockets, and concealed side adjusters for a custom fit.",
    price: 135,
    currency: "USD",
    category: "Women",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviewCount: 76,
    stock: 9,
    inStock: true,
    tag: "New",
    isFeatured: true,
    details: {
      material: "65% Recycled Polyester, 33% Viscose, 2% Elastane",
      fit: "High-rise, wide leg with gentle drape",
      care: "Machine wash gentle 30°C or dry clean",
      origin: "Made in Melzo, Italy",
    },
  },
  {
    id: "prod-4",
    name: "Minimalist Leather Crossbody Bag",
    description: "Italian full-grain vegetable-tanned leather with matte gunmetal custom hardware and magnetic foldover closure.",
    price: 175,
    currency: "USD",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    rating: 5.0,
    reviewCount: 154,
    stock: 6,
    inStock: true,
    tag: "Trending",
    isFeatured: true,
    details: {
      material: "Full-grain Italian Tuscan leather, suede interior lining",
      fit: "Compact everyday essentials profile with adjustable strap",
      care: "Clean with soft damp cloth and specialized leather balm",
      origin: "Handcrafted in Florence, Italy",
    },
  },
  {
    id: "prod-5",
    name: "Relaxed Cashmere Knit Sweater",
    description: "Ultra-soft Mongolian Grade-A cashmere designed for effortless layering with ribbed cuffs, hem, and classic crew neckline.",
    price: 195,
    originalPrice: 230,
    currency: "USD",
    category: "New Arrivals",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewCount: 62,
    stock: 12,
    inStock: true,
    tag: "New",
    isFeatured: true,
    details: {
      material: "100% Sustainable Mongolian Cashmere (2-ply)",
      fit: "Relaxed easy fit through body and sleeves",
      care: "Hand wash cold with wool shampoo or dry clean",
      origin: "Spun in Ulaanbaatar, Mongolia",
    },
  },
  {
    id: "prod-6",
    name: "Architectural Chrono Watch",
    description: "Brushed 316L stainless steel case with scratch-resistant sapphire crystal lens and interchangeable quick-release strap.",
    price: 220,
    currency: "USD",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviewCount: 89,
    stock: 15,
    inStock: true,
    tag: "Limited",
    isFeatured: true,
    details: {
      material: "316L Marine-Grade Stainless Steel, Sapphire Crystal",
      fit: "40mm dial diameter, 8.5mm case depth, 5 ATM water resistance",
      care: "Wipe with microfiber cloth",
      origin: "Assembled in Geneva, Switzerland",
    },
  },
  {
    id: "prod-7",
    name: "Raw Denim Studio Overshirt",
    description: "13.5 oz Japanese selvedge denim jacket finished with clean patch pockets, copper rivets, and organic horn buttons.",
    price: 165,
    currency: "USD",
    category: "Men",
    image: "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewCount: 110,
    stock: 18,
    inStock: true,
    tag: "Trending",
    isFeatured: true,
    details: {
      material: "100% Selvedge Indigo Cotton (13.5 oz)",
      fit: "Regular boxy overshirt cut, unlined",
      care: "Cold soak inside out, hang dry away from direct sun",
      origin: "Kojima, Okayama Prefecture, Japan",
    },
  },
  {
    id: "prod-8",
    name: "Monochrome Low-Profile Sneaker",
    description: "Handcrafted calfskin leather upper with breathable leather lining and responsive cushioned vulcanized rubber cupsole.",
    price: 150,
    currency: "USD",
    category: "New Arrivals",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviewCount: 98,
    stock: 8,
    inStock: true,
    tag: "Bestseller",
    isFeatured: true,
    details: {
      material: "Italian Calfskin Leather, Margom Rubber Sole",
      fit: "True to size; size down if in between sizes",
      care: "Protect with water-repellent spray, wipe clean",
      origin: "Handmade in Marche, Italy",
    },
  },
];

export const mockValueProps: ValueProp[] = [
  {
    id: "val-quality",
    title: "Uncompromising Quality",
    description: "Crafted with ethical, certified fabrics and rigorous artisanal standards built to endure.",
    iconName: "quality",
  },
  {
    id: "val-shipping",
    title: "Express Global Delivery",
    description: "Complimentary priority carbon-neutral shipping on all regional orders over $100.",
    iconName: "shipping",
  },
  {
    id: "val-security",
    title: "Secure Payments",
    description: "Bank-grade 256-bit SSL encrypted checkout with Apple Pay, cards, and flexible payment plans.",
    iconName: "security",
  },
  {
    id: "val-returns",
    title: "30-Day Effortless Returns",
    description: "Try at home with our complimentary prepaid shipping labels and quick refund turnaround.",
    iconName: "returns",
  },
];

// Data access helpers
export function getAllProducts(): Product[] {
  return mockProducts;
}

export function getProductById(id: string): Product | undefined {
  return mockProducts.find((p) => p.id === id);
}

export function getRelatedProducts(currentId: string, category: string, limit: number = 3): Product[] {
  const sameCategory = mockProducts.filter((p) => p.id !== currentId && p.category === category);
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }
  const others = mockProducts.filter((p) => p.id !== currentId && p.category !== category);
  return [...sameCategory, ...others].slice(0, limit);
}
