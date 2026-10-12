# VELORA — Modern Fashion E-Commerce Platform

A full-stack fashion e-commerce platform built with **Next.js, TypeScript, Supabase and Tailwind CSS**, featuring product management, shopping cart, checkout, order processing, and a protected admin dashboard.

🌐 **Live Demo:** `YOUR_VERCEL_URL`
📦 **GitHub:** `https://github.com/Sriram-0549/velora-ecommerce`

---

## Overview

**VELORA** is a modern, responsive e-commerce application designed to demonstrate a complete online shopping workflow from product discovery to order management.

The application includes both a **customer-facing storefront** and a **protected administrative system**.

The project was built with a production-oriented architecture using Next.js API routes, Supabase PostgreSQL, server-side validation, Row Level Security (RLS), and protected admin operations.

---

## Key Features

### 🛍️ Customer Storefront

* Responsive fashion e-commerce homepage
* Product listing and discovery
* Product search
* Category filtering
* Dynamic product detail pages
* Product ratings and stock information
* Responsive navigation
* Customer account page

### 🛒 Shopping Cart

* Add products to cart
* Increase/decrease product quantity
* Remove products
* Automatic cart totals
* Persistent cart state using local storage
* Cart item counter
* Empty cart handling

### 💳 Checkout

* Customer information form
* Shipping address collection
* Order summary
* Delivery charge calculation
* Cash on Delivery support
* Online Payment demo option
* Form validation
* Server-side price validation
* Unique order ID generation
* Cart clearing after successful order

> Payment gateway integration is intentionally not included; the online payment option is currently a demo flow.

### 📦 Order Management

* Order creation through API
* Order item snapshots
* Product and price validation
* Stock validation
* Order status tracking
* Order details
* Estimated delivery information
* Admin order status updates

Supported order statuses include:

* Processing
* Confirmed
* Shipped
* Delivered
* Cancelled

### 🔐 Admin Dashboard

Protected admin area with:

* Admin login
* Secure HTTP-only session cookie
* Product management
* Add products
* Edit products
* Delete products
* Order management
* Order details
* Order status updates
* Logout

Admin operations are protected both at the page level and API level.

---

## Technology Stack

| Technology             | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| Next.js                | Full-stack React framework               |
| React                  | User interface                           |
| TypeScript             | Type-safe development                    |
| Tailwind CSS           | Styling and responsive UI                |
| Supabase               | PostgreSQL database and backend services |
| Next.js Route Handlers | REST API endpoints                       |
| Git & GitHub           | Version control                          |
| Vercel                 | Production deployment                    |

---

## Architecture

```text
                    ┌─────────────────────┐
                    │      Customer       │
                    │     Web Browser     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Next.js        │
                    │   App Router + UI   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    API Route        │
                    │      Handlers       │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │    Supabase     │        │ Admin System    │
        │    PostgreSQL   │        │ Authentication  │
        └─────────────────┘        └─────────────────┘
```

### Production Flow

```text
User
 ↓
Vercel
 ↓
Next.js
 ↓
API Route Handlers
 ↓
Supabase PostgreSQL
```

The application separates public customer operations from protected administrative operations.

---

## API Architecture

VELORA uses Next.js server-side Route Handlers to expose REST-style APIs.

### Products

```text
GET    /api/products
GET    /api/products/[id]

POST   /api/products
PUT    /api/products/[id]
DELETE /api/products/[id]
```

Public operations:

* Retrieve products
* Retrieve individual product details

Protected operations:

* Create product
* Update product
* Delete product

---

### Orders

```text
POST /api/orders

GET /api/orders
GET /api/orders/[id]
PUT /api/orders/[id]
```

Customer checkout uses:

```text
POST /api/orders
```

The server validates:

* Customer information
* Product existence
* Product stock
* Product prices
* Quantities
* Order totals

The server then creates the order and associated order items.

Administrative order retrieval and status updates require authentication.

---

## Database Design

VELORA uses Supabase PostgreSQL with two primary order-related tables.

### Products

```text
products
├── id
├── name
├── description
├── price
├── category
├── image
├── rating
└── stock
```

### Orders

```text
orders
├── id
├── customer_name
├── customer_email
├── customer_phone
├── shipping_address
├── city
├── state
├── pincode
├── subtotal
├── delivery_charge
├── discount
├── total
├── currency
├── payment_method
├── payment_status
├── status
├── estimated_delivery
├── created_at
└── updated_at
```

### Order Items

```text
order_items
├── id
├── order_id
├── product_id
├── product_name
├── product_price
├── product_image
├── quantity
├── item_total
└── created_at
```

Order items store product information as a snapshot so that historical orders remain meaningful even if product information changes later.

---

## Security

Security was considered throughout the application architecture.

### Environment Variables

Sensitive configuration is stored using environment variables.

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
```

Sensitive server-side variables are never exposed through `NEXT_PUBLIC_` variables.

### Supabase Row Level Security

Supabase Row Level Security (RLS) is enabled for protected order data.

The service-role key is used only on the server for privileged operations.

### Admin Authentication

Administrative pages and APIs are protected using a server-side session stored in an HTTP-only cookie.

Unauthenticated administrative API requests return:

```text
401 Unauthorized
```

### Git Security

Sensitive files such as:

```text
.env
.env.local
```

are excluded from version control.

---

## Project Structure

```text
CJ-Store/
│
├── src/
│   ├── app/
│   │   ├── account/
│   │   ├── admin/
│   │   ├── api/
│   │   │   ├── orders/
│   │   │   └── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── order-success/
│   │   ├── products/
│   │   ├── shop/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   ├── config/
│   ├── context/
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   ├── proxy.ts
│   └── types/
│
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
└── README.md
```

---

## Responsive Design

VELORA was designed to work across:

* Mobile devices
* Tablets
* Desktop screens

The responsive implementation includes:

* Mobile navigation
* Responsive product grids
* Flexible product cards
* Responsive checkout
* Responsive cart
* Responsive admin dashboard
* Mobile-friendly tables
* Touch-friendly controls
* Responsive typography and spacing

---

## Production Deployment

VELORA is deployed using **Vercel**.

Deployment workflow:

```text
Local Development
       ↓
      Git
       ↓
    GitHub
       ↓
     Vercel
       ↓
 Production
```

Every production deployment uses the source code from the GitHub repository and the required environment variables configured in Vercel.

---

## Environment Setup

Create a local `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
ADMIN_SESSION_SECRET=your_secure_session_secret
```

Never commit `.env.local` to GitHub.

---

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/Sriram-0549/velora-ecommerce.git
cd velora-ecommerce
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env.local` and add the required Supabase and admin configuration.

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Production Build

To verify the production build locally:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

---

## Testing the Application

The main production workflows include:

### Customer Flow

```text
Homepage
 ↓
Products
 ↓
Product Details
 ↓
Add to Cart
 ↓
Cart
 ↓
Checkout
 ↓
Place Order
 ↓
Order Success
```

### Admin Flow

```text
Admin Login
 ↓
Admin Dashboard
 ↓
Products / Orders
 ↓
Manage Products
 ↓
Manage Orders
 ↓
Update Order Status
```

---

## Future Improvements

Potential future enhancements include:

* Real payment gateway integration
* Customer authentication
* Customer order history
* Product image storage using Supabase Storage
* Wishlist functionality
* Product reviews
* Coupon system
* Email order notifications
* Inventory management
* Advanced analytics dashboard
* Automated CI/CD pipeline
* Automated testing
* Monitoring and logging

---

## Project Highlights

VELORA demonstrates practical experience with:

* Full-stack Next.js development
* REST API design
* PostgreSQL database integration
* Server-side validation
* Authentication and authorization
* Secure environment configuration
* Database Row Level Security
* CRUD operations
* E-commerce workflows
* Responsive UI development
* Git-based deployment
* Production deployment with Vercel

---

## Author

**Sriram C.J**

BCA Graduate | DevOps & Full-Stack Development

GitHub:
`https://github.com/Sriram-0549`

---

## License

This project is currently intended as a portfolio and demonstration project.