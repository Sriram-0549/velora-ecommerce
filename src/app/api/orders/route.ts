import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { checkAdminAuth, getAuthContext } from "@/lib/auth";
import { mockProducts } from "@/data/mockData";

export const dynamic = "force-dynamic";

interface CartItemInput {
  productId?: string | number;
  product_id?: string | number;
  id?: string | number;
  product?: {
    id?: string | number;
    productId?: string | number;
    product_id?: string | number;
    name?: string;
    price?: number;
    image?: string;
    imageUrl?: string;
  };
  quantity?: number;
}

interface OrderRequestBody {
  id?: string;
  orderId?: string;
  order_id?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  paymentMethod?: string;
  payment_method?: string;
  items?: CartItemInput[];
  cartItems?: CartItemInput[];
}

/**
 * GET /api/orders
 * Admin or Customer endpoint:
 * - Administrators can retrieve all store orders.
 * - Authenticated customers can retrieve ONLY their own orders.
 * - Unauthenticated callers receive 401 Unauthorized.
 */
export async function GET(request: Request) {
  try {
    const authContext = await getAuthContext(request);

    if (!authContext.isAdmin && !authContext.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required to view orders." },
        { status: 401 }
      );
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        {
          error: "Server configuration required",
          message:
            "SUPABASE_SERVICE_ROLE_KEY is missing or unconfigured in .env.local. A server-only service-role key is required to query orders when Row-Level Security (RLS) is enabled.",
        },
        { status: 500 }
      );
    }

    let query = supabaseAdmin
      .from("orders")
      .select(
        "id, customer_name, customer_email, customer_phone, shipping_address, city, state, pincode, subtotal, delivery_charge, discount, total, currency, payment_method, payment_status, status, estimated_delivery, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    // Restrict customer orders to their authenticated email
    if (!authContext.isAdmin && authContext.user?.email) {
      query = query.ilike("customer_email", authContext.user.email.trim());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase query orders error:", error);
      return NextResponse.json(
        {
          error: "Database error",
          message: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? [], { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error in GET /api/orders:", err);
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
 * POST /api/orders
 * Validates customer details, verifies product existence and stock against database,
 * calculates authoritative totals on the server in INR, and persists the order into Supabase.
 */
export async function POST(request: Request) {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        {
          error: "Server configuration required",
          message:
            "SUPABASE_SERVICE_ROLE_KEY is missing or unconfigured in .env.local. A server-only service-role key is required to insert orders when Row-Level Security (RLS) is enabled without public write access.",
        },
        { status: 500 }
      );
    }

    let body: OrderRequestBody;
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

    // Extract customer details supporting both nested customer object and flat snake_case
    const customer = body.customer || {};
    const customerName = (body.customer_name || customer.name || "").trim();
    const customerEmail = (body.customer_email || customer.email || "").trim();
    const customerPhone = (body.customer_phone || customer.phone || "").trim();
    const shippingAddress = (body.shipping_address || customer.address || "").trim();
    const city = (body.city || customer.city || "").trim();
    const state = (body.state || customer.state || "").trim();
    const pincode = (body.pincode || customer.pincode || "").trim();
    const paymentMethodRaw = (body.payment_method || body.paymentMethod || "cod").trim();

    // 1. Validation: Customer Name
    if (!customerName || customerName.length < 2) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "Field 'customer_name' is required and must be at least 2 characters.",
        },
        { status: 400 }
      );
    }

    // 2. Validation: Customer Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail || !emailRegex.test(customerEmail)) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "Field 'customer_email' is required and must be a valid email address.",
        },
        { status: 400 }
      );
    }

    // 3. Validation: Customer Phone (requires at least 10 digits)
    const cleanPhone = customerPhone.replace(/[\s\-+()]/g, "");
    if (!customerPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "Field 'customer_phone' is required and must be a valid phone number (at least 10 digits).",
        },
        { status: 400 }
      );
    }

    // 4. Validation: Shipping Address
    if (!shippingAddress || shippingAddress.length < 5) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "Field 'shipping_address' is required and must be at least 5 characters.",
        },
        { status: 400 }
      );
    }

    // 5. Validation: City & State
    if (!city) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "Field 'city' is required.",
        },
        { status: 400 }
      );
    }

    if (!state) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "Field 'state' is required.",
        },
        { status: 400 }
      );
    }

    // 6. Validation: Pincode (Indian 6-digit standard or international postal)
    if (!pincode || pincode.length < 4) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "Field 'pincode' is required and must be a valid postal code.",
        },
        { status: 400 }
      );
    }

    // 7. Validation: Payment Method
    const allowedPaymentMethods = ["cod", "online_demo"];
    const paymentMethod = allowedPaymentMethods.includes(paymentMethodRaw)
      ? paymentMethodRaw
      : "cod";

    // 8. Validation: Cart Items array
    const rawItems = body.items || body.cartItems;
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "The cart must contain at least one item.",
        },
        { status: 400 }
      );
    }

    // Parse item requests
    interface ParsedItem {
      productId: string | number;
      quantity: number;
    }
    const parsedItems: ParsedItem[] = [];

    for (let i = 0; i < rawItems.length; i++) {
      const item = rawItems[i];
      const pId =
        item.productId ??
        item.product_id ??
        item.product?.id ??
        item.product?.productId ??
        item.id;

      if (!pId) {
        return NextResponse.json(
          {
            error: "Validation error",
            message: `Item at index ${i} is missing a valid product ID.`,
          },
          { status: 400 }
        );
      }

      const qty = typeof item.quantity === "number" ? item.quantity : Number(item.quantity);
      if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
        return NextResponse.json(
          {
            error: "Validation error",
            message: `Item at index ${i} has an invalid quantity. Quantity must be a positive integer.`,
          },
          { status: 400 }
        );
      }

      parsedItems.push({ productId: pId, quantity: qty });
    }

    // 9. Fetch and verify every product from Supabase (or fallback to catalog if offline)
    const productIds = Array.from(new Set(parsedItems.map((p) => p.productId)));

    const productsMap = new Map<string, any>();

    try {
      const { data: dbProducts, error: productsError } = await supabaseAdmin
        .from("products")
        .select("*")
        .in("id", productIds);

      if (!productsError && Array.isArray(dbProducts)) {
        for (const prod of dbProducts) {
          productsMap.set(String(prod.id), prod);
        }
      }
    } catch (err) {
      console.warn("Supabase products lookup offline/unreachable during checkout, checking mockProducts:", err);
    }

    // Populate fallback mock catalogue products for any product IDs not found in Supabase
    for (const mockProd of mockProducts) {
      if (!productsMap.has(String(mockProd.id))) {
        productsMap.set(String(mockProd.id), mockProd);
      }
    }

    // Verify all requested products exist and check stock
    const validatedOrderItems: Array<{
      productId: number | string;
      productName: string;
      productPrice: number;
      productImage: string | null;
      quantity: number;
      itemTotal: number;
    }> = [];

    let calculatedSubtotal = 0;

    for (const item of parsedItems) {
      const dbProduct = productsMap.get(String(item.productId));

      if (!dbProduct) {
        return NextResponse.json(
          {
            error: "Product not found",
            message: `Product with ID '${item.productId}' does not exist in our store inventory.`,
          },
          { status: 404 }
        );
      }

      // Stock verification
      const availableStock =
        typeof dbProduct.stock === "number" ? dbProduct.stock : 0;

      if (availableStock < item.quantity) {
        return NextResponse.json(
          {
            error: "Insufficient stock",
            message: `Cannot purchase ${item.quantity} units of '${dbProduct.name}'. Only ${availableStock} unit(s) available in stock.`,
            productId: dbProduct.id,
            availableStock,
            requestedQuantity: item.quantity,
          },
          { status: 400 }
        );
      }

      const authoritativePrice =
        typeof dbProduct.price === "number"
          ? dbProduct.price
          : Number(dbProduct.price) || 0;

      const itemTotal = authoritativePrice * item.quantity;
      calculatedSubtotal += itemTotal;

      validatedOrderItems.push({
        productId: dbProduct.id,
        productName: dbProduct.name,
        productPrice: authoritativePrice,
        productImage: dbProduct.image || null,
        quantity: item.quantity,
        itemTotal,
      });
    }

    // 10. Calculate authoritative financial totals in INR
    // Delivery policy: Orders >= ₹500 get free express shipping, otherwise ₹50
    const freeShippingThreshold = 500;
    const deliveryCharge = calculatedSubtotal >= freeShippingThreshold ? 0 : 50;
    const discount = 0;
    const finalTotal = calculatedSubtotal + deliveryCharge - discount;

    // 11. Generate or use frontend-compatible Order ID
    const customOrderId = (body.order_id || body.orderId || body.id || "").trim();
    const orderId =
      customOrderId.startsWith("VEL-") && customOrderId.length >= 7
        ? customOrderId
        : `VEL-${Math.floor(100000 + Math.random() * 900000)}`;

    // Estimated delivery: 4 business days from now
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);
    const estimatedDelivery = deliveryDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // 12. Insert master record into 'orders' table
    const authContext = await getAuthContext(request);
    const userId = authContext.user?.id && authContext.user.id !== "admin-env" ? authContext.user.id : null;

    const orderRecord: Record<string, any> = {
      id: orderId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      shipping_address: shippingAddress,
      city,
      state,
      pincode,
      subtotal: calculatedSubtotal,
      delivery_charge: deliveryCharge,
      discount,
      total: finalTotal,
      currency: "INR",
      payment_method: paymentMethod,
      payment_status: "pending",
      status: "processing",
      estimated_delivery: estimatedDelivery,
      ...(userId ? { user_id: userId } : {}),
    };

    let { data: insertedOrder, error: orderInsertError } = await supabaseAdmin
      .from("orders")
      .insert([orderRecord])
      .select()
      .single();

    // If user_id column does not exist in database yet (PostgREST PGRST204, schema cache, or SQL 42703), retry without user_id
    if (
      orderInsertError &&
      orderRecord.user_id &&
      (orderInsertError.code === "42703" ||
        orderInsertError.code === "PGRST204" ||
        orderInsertError.message?.toLowerCase().includes("user_id") ||
        orderInsertError.message?.toLowerCase().includes("schema cache"))
    ) {
      delete orderRecord.user_id;
      const retry = await supabaseAdmin
        .from("orders")
        .insert([orderRecord])
        .select()
        .single();
      insertedOrder = retry.data;
      orderInsertError = retry.error;
    }

    if (orderInsertError) {
      console.error("Supabase orders insert error:", orderInsertError);
      const isRlsError = orderInsertError.code === "42501";
      return NextResponse.json(
        {
          error: "Database error",
          message: orderInsertError.message,
          code: orderInsertError.code,
          hint: isRlsError
            ? "Supabase Row-Level Security (RLS) is blocking inserts to the 'orders' table. Please ensure a valid SUPABASE_SERVICE_ROLE_KEY is configured in .env.local."
            : undefined,
        },
        { status: 500 }
      );
    }

    // 13. Insert line items into 'order_items' table
    const lineItemsToInsert = validatedOrderItems.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      product_name: item.productName,
      product_price: item.productPrice,
      product_image: item.productImage,
      quantity: item.quantity,
      item_total: item.itemTotal,
    }));

    const { data: insertedItems, error: itemsInsertError } = await supabaseAdmin
      .from("order_items")
      .insert(lineItemsToInsert)
      .select();

    if (itemsInsertError) {
      console.error("Supabase order_items insert error:", itemsInsertError);
      // Attempt to clean up orphaned master order if line item insertion fails
      await supabaseAdmin.from("orders").delete().eq("id", orderId);

      const isRlsError = itemsInsertError.code === "42501";
      return NextResponse.json(
        {
          error: "Database error",
          message: "Failed to persist order line items.",
          details: itemsInsertError.message,
          code: itemsInsertError.code,
          hint: isRlsError
            ? "Supabase Row-Level Security (RLS) is blocking inserts to the 'order_items' table. Please ensure a valid SUPABASE_SERVICE_ROLE_KEY is configured in .env.local."
            : undefined,
        },
        { status: 500 }
      );
    }

    // 14. Return HTTP 201 with created order details
    return NextResponse.json(
      {
        message: "Order placed successfully.",
        order: {
          ...insertedOrder,
          items: insertedItems ?? lineItemsToInsert,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Unexpected error in POST /api/orders:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: err instanceof Error ? err.message : "An unexpected server error occurred.",
      },
      { status: 500 }
    );
  }
}
