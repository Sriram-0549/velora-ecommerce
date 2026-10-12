"use client";

import { useState, useEffect, useCallback } from "react";
import { Product } from "@/types";
import { mockProducts } from "@/data/mockData";

// High-resolution fallback image if product image in database is null or blank
const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80";

/**
 * Normalizes raw records from Supabase into the application's Product interface
 */
export function mapSupabaseProductToProduct(raw: Record<string, any>): Product {
  const stock = typeof raw.stock === "number" ? raw.stock : 10;
  const image = raw.image || raw.imageUrl || raw.image_url || FALLBACK_PRODUCT_IMAGE;

  return {
    id: String(raw.id),
    name: raw.name || "Untitled Product",
    description: raw.description || "",
    price: typeof raw.price === "number" ? raw.price : Number(raw.price) || 0,
    originalPrice:
      typeof raw.originalPrice === "number"
        ? raw.originalPrice
        : typeof raw.original_price === "number"
        ? raw.original_price
        : undefined,
    currency: raw.currency || "INR",
    category: raw.category || "Men",
    image: image,
    imageUrl: image,
    rating: typeof raw.rating === "number" ? raw.rating : 4.8,
    reviewCount:
      typeof raw.reviewCount === "number"
        ? raw.reviewCount
        : typeof raw.review_count === "number"
        ? raw.review_count
        : 24,
    stock: stock,
    inStock: typeof raw.inStock === "boolean" ? raw.inStock : stock > 0,
    tag: raw.tag || (stock > 0 && stock <= 5 ? "Limited" : undefined),
    isFeatured:
      typeof raw.isFeatured === "boolean"
        ? raw.isFeatured
        : typeof raw.is_featured === "boolean"
        ? raw.is_featured
        : true,
    details: raw.details || {
      material: raw.material || "100% Premium Heavyweight Cotton",
      fit: raw.fit || "Relaxed, tailored silhouette",
      care: raw.care || "Machine wash gentle cold, lay flat to dry",
      origin: raw.origin || "Ethically crafted",
    },
  };
}

/**
 * Reusable fetch function to retrieve products from GET /api/products
 * Falls back gracefully to mock catalogue if the network or API is temporarily down.
 */
export async function fetchProductsFromApi(): Promise<Product[]> {
  try {
    const response = await fetch("/api/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn(`GET /api/products returned status ${response.status}, falling back to catalogue`);
      return mockProducts;
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return mockProducts;
    }

    return data.map(mapSupabaseProductToProduct);
  } catch (err) {
    console.warn("fetchProductsFromApi connection notice, using mockProducts:", err);
    return mockProducts;
  }
}

/**
 * Reusable fetch function to retrieve a single product from GET /api/products/[id]
 */
export async function fetchProductByIdFromApi(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      return mockProducts.find((p) => String(p.id) === String(id)) || null;
    }

    if (!response.ok) {
      return mockProducts.find((p) => String(p.id) === String(id)) || null;
    }

    const data = await response.json();
    if (!data || typeof data !== "object") {
      return mockProducts.find((p) => String(p.id) === String(id)) || null;
    }

    return mapSupabaseProductToProduct(data);
  } catch (err) {
    console.warn("fetchProductByIdFromApi connection notice, using mock fallback:", err);
    return mockProducts.find((p) => String(p.id) === String(id)) || null;
  }
}

/**
 * Hook for consuming products across list views, filters, and featured sections
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProductsFromApi();
      setProducts(data);
    } catch (err: unknown) {
      console.warn("useProducts failed to load from API, falling back to mockProducts:", err);
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    refetch: loadProducts,
  };
}

/**
 * Hook for consuming an individual product directly from GET /api/products/[id]
 */
export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  const loadProduct = useCallback(async () => {
    if (!id) {
      setProduct(null);
      setIsNotFound(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsNotFound(false);
      const data = await fetchProductByIdFromApi(id);
      if (!data) {
        const fallback = mockProducts.find((p) => String(p.id) === String(id));
        if (fallback) {
          setProduct(fallback);
          setIsNotFound(false);
        } else {
          setProduct(null);
          setIsNotFound(true);
        }
      } else {
        setProduct(data);
        setIsNotFound(false);
      }
    } catch (err: unknown) {
      const fallback = mockProducts.find((p) => String(p.id) === String(id));
      if (fallback) {
        setProduct(fallback);
        setIsNotFound(false);
      } else {
        const message = err instanceof Error ? err.message : "Failed to load product";
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  return {
    product,
    loading,
    error,
    isNotFound,
    refetch: loadProduct,
  };
}
