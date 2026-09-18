import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { checkAdminAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}


/**
 * GET /api/products/[id]
 * Retrieves a single product by ID from the Supabase "products" table.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
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

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "A valid product ID must be provided.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      // If the ID format does not match PostgreSQL column type (e.g. non-numeric string for bigint), treat as not found
      if (error.code === "22P02") {
        return NextResponse.json(
          {
            error: "Product not found",
            message: `Product with ID '${id}' was not found.`,
          },
          { status: 404 }
        );
      }

      console.error("Supabase query error:", error);
      return NextResponse.json(
        {
          error: "Database error",
          message: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error: "Product not found",
          message: `Product with ID '${id}' was not found.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error in GET /api/products/[id]:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: err instanceof Error ? err.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id]
 * Updates fields of an existing product in the Supabase "products" table.
 * Returns the updated product with HTTP 200.
 */
export async function PUT(
  request: Request,
  { params }: RouteContext
) {
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

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "A valid product ID must be provided.",
        },
        { status: 400 }
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

    const updates: Record<string, any> = {};

    // Validate fields if provided
    if ("name" in body) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json(
          {
            error: "Validation error",
            message: "Field 'name' must be a non-empty string.",
          },
          { status: 400 }
        );
      }
      updates.name = body.name.trim();
    }

    if ("price" in body) {
      const price = typeof body.price === "number" ? body.price : Number(body.price);
      if (body.price === null || isNaN(price) || price < 0) {
        return NextResponse.json(
          {
            error: "Validation error",
            message: "Field 'price' must be a valid non-negative number.",
          },
          { status: 400 }
        );
      }
      updates.price = price;
    }

    if ("category" in body) {
      if (typeof body.category !== "string" || !body.category.trim()) {
        return NextResponse.json(
          {
            error: "Validation error",
            message: "Field 'category' must be a non-empty string.",
          },
          { status: 400 }
        );
      }
      updates.category = body.category.trim();
    }

    if ("stock" in body) {
      const stock = typeof body.stock === "number" ? body.stock : Number(body.stock);
      if (body.stock === null || isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
        return NextResponse.json(
          {
            error: "Validation error",
            message: "Field 'stock' must be a valid non-negative integer.",
          },
          { status: 400 }
        );
      }
      updates.stock = stock;
    }

    if ("description" in body) {
      if (body.description !== null && typeof body.description !== "string") {
        return NextResponse.json(
          {
            error: "Validation error",
            message: "Field 'description' must be a string or null.",
          },
          { status: 400 }
        );
      }
      updates.description = typeof body.description === "string" ? body.description.trim() : null;
    }

    if ("image" in body) {
      if (body.image !== null && typeof body.image !== "string") {
        return NextResponse.json(
          {
            error: "Validation error",
            message: "Field 'image' must be a string or null.",
          },
          { status: 400 }
        );
      }
      updates.image = typeof body.image === "string" && body.image.trim() ? body.image.trim() : null;
    }

    if ("rating" in body) {
      const rating = typeof body.rating === "number" ? body.rating : Number(body.rating);
      if (body.rating === null || isNaN(rating) || rating < 0 || rating > 5) {
        return NextResponse.json(
          {
            error: "Validation error",
            message: "Field 'rating' must be a number between 0 and 5.",
          },
          { status: 400 }
        );
      }
      updates.rating = rating;
    }

    // Ensure at least one update field was provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "At least one valid field to update must be provided.",
        },
        { status: 400 }
      );
    }

    // 1. Verify that the product exists
    const { data: existingProduct, error: checkError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (checkError) {
      if (checkError.code === "22P02") {
        return NextResponse.json(
          {
            error: "Product not found",
            message: `Product with ID '${id}' was not found.`,
          },
          { status: 404 }
        );
      }

      console.error("Supabase check error:", checkError);
      return NextResponse.json(
        {
          error: "Database error",
          message: checkError.message,
          code: checkError.code,
        },
        { status: 500 }
      );
    }

    if (!existingProduct) {
      return NextResponse.json(
        {
          error: "Product not found",
          message: `Product with ID '${id}' was not found.`,
        },
        { status: 404 }
      );
    }

    // 2. Perform the update in Supabase
    const db = isSupabaseAdminConfigured() ? supabaseAdmin : supabase;

    const { data: updatedProduct, error: updateError } = await db
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        {
          error: "Database error",
          message: updateError.message,
          code: updateError.code,
        },
        { status: 500 }
      );
    }

    if (!updatedProduct) {
      // Row exists but was not updated -> Row-Level Security blocked the update
      return NextResponse.json(
        {
          error: "Database error",
          message: "Row-Level Security (RLS) prevented updating this product.",
          hint: "Enable an UPDATE policy for 'anon' role in your Supabase SQL editor: `CREATE POLICY \"Allow anon update\" ON products FOR UPDATE TO anon USING (true) WITH CHECK (true);` or add SUPABASE_SERVICE_ROLE_KEY to .env.local.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error in PUT /api/products/[id]:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: err instanceof Error ? err.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 * Deletes a single product by ID from the Supabase "products" table.
 * Returns HTTP 200 on success, HTTP 404 if not found, HTTP 500 on database error.
 */
export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
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

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "A valid product ID must be provided.",
        },
        { status: 400 }
      );
    }

    // 1. Check whether the product exists before deleting
    const { data: existingProduct, error: checkError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (checkError) {
      if (checkError.code === "22P02") {
        return NextResponse.json(
          {
            error: "Product not found",
            message: `Product with ID '${id}' was not found.`,
          },
          { status: 404 }
        );
      }

      console.error("Supabase check error:", checkError);
      return NextResponse.json(
        {
          error: "Database error",
          message: checkError.message,
          code: checkError.code,
        },
        { status: 500 }
      );
    }

    if (!existingProduct) {
      return NextResponse.json(
        {
          error: "Product not found",
          message: `Product with ID '${id}' was not found.`,
        },
        { status: 404 }
      );
    }

    // 2. Delete the product from the Supabase "products" table
    const db = isSupabaseAdminConfigured() ? supabaseAdmin : supabase;

    const { data: deletedProduct, error: deleteError } = await db
      .from("products")
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();

    if (deleteError) {
      console.error("Supabase delete error:", deleteError);
      return NextResponse.json(
        {
          error: "Database error",
          message: deleteError.message,
          code: deleteError.code,
        },
        { status: 500 }
      );
    }

    if (!deletedProduct) {
      // If row existed but delete returned null, RLS policy blocked the delete
      return NextResponse.json(
        {
          error: "Database error",
          message: "Row-Level Security (RLS) prevented deleting this product.",
          hint: "Enable a DELETE policy for 'anon' role in your Supabase SQL editor: `CREATE POLICY \"Allow anon delete\" ON products FOR DELETE TO anon USING (true);` or add SUPABASE_SERVICE_ROLE_KEY to .env.local.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: `Product with ID '${id}' has been successfully deleted.`,
        product: deletedProduct,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Unexpected error in DELETE /api/products/[id]:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: err instanceof Error ? err.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
