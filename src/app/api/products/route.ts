import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { checkAdminAuth } from "@/lib/auth";
import { mockProducts } from "@/data/mockData";

export const dynamic = "force-dynamic";

/**
 * GET /api/products
 * Retrieves all products from the Supabase "products" table.
 * Falls back gracefully to mockProducts if Supabase is unreachable or offline.
 */
export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(mockProducts, { status: 200 });
    }

    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) {
      console.warn("Supabase query products notice, falling back to mockProducts:", error.message);
      return NextResponse.json(mockProducts, { status: 200 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(mockProducts, { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.warn("Supabase connection offline or unreachable, falling back to mockProducts:", err);
    return NextResponse.json(mockProducts, { status: 200 });
  }
}

/**
 * POST /api/products
 * Validates incoming JSON data and inserts a new product into the Supabase "products" table.
 * Returns the created product with HTTP 201.
 */
export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Admin authentication required." },
        { status: 401 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          error: "Supabase not configured",
          message:
            "Supabase credentials are missing or still set to placeholders. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.",
        },
        { status: 500 }
      );
    }

    let body: Record<string, any>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON",
          message: "The request body must be valid JSON.",
        },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        {
          error: "Invalid input",
          message: "Request body must be a JSON object.",
        },
        { status: 400 }
      );
    }

    // Required field: name (non-empty string)
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "Field 'name' is required and must be a non-empty string.",
        },
        { status: 400 }
      );
    }

    // Required field: price (non-negative number)
    const price = typeof body.price === "number" ? body.price : Number(body.price);
    if (body.price === undefined || body.price === null || isNaN(price) || price < 0) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "Field 'price' is required and must be a valid non-negative number.",
        },
        { status: 400 }
      );
    }

    // Required field: category (non-empty string)
    const category = typeof body.category === "string" ? body.category.trim() : "";
    if (!category) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "Field 'category' is required and must be a non-empty string.",
        },
        { status: 400 }
      );
    }

    // Required field: stock (non-negative integer)
    const stock = typeof body.stock === "number" ? body.stock : Number(body.stock);
    if (
      body.stock === undefined ||
      body.stock === null ||
      isNaN(stock) ||
      stock < 0 ||
      !Number.isInteger(stock)
    ) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "Field 'stock' is required and must be a valid non-negative integer.",
        },
        { status: 400 }
      );
    }

    // Optional fields
    const description =
      typeof body.description === "string" ? body.description.trim() : null;

    const image =
      typeof body.image === "string" && body.image.trim() ? body.image.trim() : null;

    const rating =
      typeof body.rating === "number" && !isNaN(body.rating)
        ? body.rating
        : body.rating !== undefined && !isNaN(Number(body.rating))
        ? Number(body.rating)
        : 5.0;

    const newProduct = {
      name,
      description,
      price,
      category,
      image,
      rating,
      stock,
    };

    const db = isSupabaseAdminConfigured() ? supabaseAdmin : supabase;

    const { data, error } = await db
      .from("products")
      .insert([newProduct])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      const isRlsViolation = error.code === "42501";
      return NextResponse.json(
        {
          error: "Database error",
          message: error.message,
          code: error.code,
          hint: isRlsViolation
            ? "Supabase Row-Level Security (RLS) is blocking inserts. Enable an INSERT policy for 'anon' role in your Supabase SQL editor: `CREATE POLICY \"Allow anon insert\" ON products FOR INSERT TO anon WITH CHECK (true);` or add SUPABASE_SERVICE_ROLE_KEY to .env.local."
            : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    console.error("Unexpected error in POST /api/products:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: err instanceof Error ? err.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
