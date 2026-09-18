import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { checkAdminAuth } from "@/lib/auth";
import { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

const ALLOWED_STATUSES: OrderStatus[] = [
  "processing",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

/**
 * GET /api/orders/[id]
 * Admin endpoint: Retrieves a single customer order and all its associated line items.
 * Uses the server-only supabaseAdmin client to securely bypass RLS.
 */
export async function GET(
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

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        {
          error: "Server configuration required",
          message:
            "SUPABASE_SERVICE_ROLE_KEY is missing or unconfigured in .env.local. A server-only service-role key is required to query orders.",
        },
        { status: 500 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "A valid order ID must be provided.",
        },
        { status: 400 }
      );
    }

    // 1. Fetch order header
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (orderError) {
      console.error("Supabase query order error:", orderError);
      return NextResponse.json(
        {
          error: "Database error",
          message: orderError.message,
          code: orderError.code,
        },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found",
          message: `Order with ID '${id}' was not found.`,
        },
        { status: 404 }
      );
    }

    // 2. Fetch associated line items
    const { data: items, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .select("*")
      .eq("order_id", id)
      .order("id", { ascending: true });

    if (itemsError) {
      console.error("Supabase query order_items error:", itemsError);
      return NextResponse.json(
        {
          error: "Database error",
          message: itemsError.message,
          code: itemsError.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ...order,
        items: items ?? [],
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Unexpected error in GET /api/orders/[id]:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: err instanceof Error ? err.message : "An unexpected server error occurred.",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orders/[id]
 * Admin endpoint: Updates an order's status and records the updated_at timestamp.
 * Allowed statuses: processing, confirmed, shipped, delivered, cancelled.
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

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        {
          error: "Server configuration required",
          message:
            "SUPABASE_SERVICE_ROLE_KEY is missing or unconfigured in .env.local. A server-only service-role key is required to update orders.",
        },
        { status: 500 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "A valid order ID must be provided.",
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

    const { status } = body;

    if (!status || typeof status !== "string") {
      return NextResponse.json(
        {
          error: "Validation error",
          message: `Field 'status' is required and must be one of: ${ALLOWED_STATUSES.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    const normalizedStatus = status.toLowerCase().trim() as OrderStatus;

    if (!ALLOWED_STATUSES.includes(normalizedStatus)) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: `Invalid status '${status}'. Allowed values are: ${ALLOWED_STATUSES.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    // 1. Verify order exists before attempting update
    const { data: existingOrder, error: checkError } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (checkError) {
      console.error("Supabase check order error:", checkError);
      return NextResponse.json(
        {
          error: "Database error",
          message: checkError.message,
          code: checkError.code,
        },
        { status: 500 }
      );
    }

    if (!existingOrder) {
      return NextResponse.json(
        {
          error: "Order not found",
          message: `Order with ID '${id}' was not found.`,
        },
        { status: 404 }
      );
    }

    // 2. Perform the update
    const nowIso = new Date().toISOString();
    const updatePayload: Record<string, any> = {
      status: normalizedStatus,
      updated_at: nowIso,
    };

    // If order is marked delivered and payment method is COD, payment status can also transition to 'paid' if requested or appropriate
    if (body.payment_status && typeof body.payment_status === "string") {
      updatePayload.payment_status = body.payment_status.trim();
    }

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("orders")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("Supabase update order error:", updateError);
      return NextResponse.json(
        {
          error: "Database error",
          message: updateError.message,
          code: updateError.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: `Order status successfully updated to '${normalizedStatus}'.`,
        order: updatedOrder,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Unexpected error in PUT /api/orders/[id]:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: err instanceof Error ? err.message : "An unexpected server error occurred.",
      },
      { status: 500 }
    );
  }
}
