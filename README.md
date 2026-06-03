# ⚗️ AasaMedChem — Inventory & Order Management System

A full-stack inventory management, unit conversion, and order processing system built for chemical laboratories and suppliers. Features role-based access for Admins, Sellers, and Buyers with precise unit conversion and INR pricing.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Drizzle](https://img.shields.io/badge/Drizzle_ORM-latest-green)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Design](#-system-design)
- [Database Schema](#-database-schema)
- [Unit Conversion Strategy](#-unit-conversion-strategy)
- [Price & Quantity Storage](#-price--quantity-storage)
- [Setup Instructions](#-setup-instructions)
- [Deployment](#-deployment)
- [Test Credentials](#-test-credentials)
- [User Guide](#-user-guide)

---

## ✨ Features

### 🔐 Authentication & Roles
- **Credentials-based** login (email/password with bcrypt hashing)
- **Google OAuth** for social login
- **Three roles**: Admin, Seller, Buyer
- JWT-based sessions (stateless, Vercel-friendly)
- Route protection via middleware

### 📦 Inventory Management (Admin)
- Create, update, delete products
- Manage categories
- Set base prices per smallest unit (gram, mL, unit)
- Monitor stock levels with low-stock alerts
- Inventory value tracking

### 🛒 Shopping Flow (Buyer)
- Browse products with search, category/dimension filters, and sorting
- **Add to cart with any supported unit** (g, kg, mL, L, units)
- **Live price calculation** with automatic unit conversion
- Place orders with notes
- Order history with full conversion breakdowns

### 📋 Order Management (Admin & Seller)
- View all incoming orders
- **Expandable order details** showing:
  - Ordered quantity in user's chosen unit
  - Base unit equivalent
  - Unit conversion verification
  - Per-unit and total pricing
- Update order status (Pending → Confirmed → Shipped → Delivered / Cancelled)
- Stock auto-restored on order cancellation

### 🎨 UI/UX
- **Light/Dark mode** with system preference detection and toggle
- Glassmorphism design with smooth animations
- Responsive layout (mobile-friendly)
- Real-time unit conversion previews

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | Next.js 16 (App Router, Server Components, Server Actions) |
| **Language** | TypeScript |
| **Database** | Neon PostgreSQL (serverless) |
| **ORM** | Drizzle ORM |
| **Authentication** | NextAuth.js v5 (Auth.js) — Credentials + Google OAuth |
| **Styling** | Vanilla CSS with CSS custom properties (design tokens) |
| **Deployment** | Vercel |

---

## 🏗 System Design

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│                                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────────┐  │
│  │ Landing  │  │  Auth   │  │  Admin  │  │   Shop    │  │
│  │  Page    │  │  Pages  │  │  Panel  │  │  (Buyer)  │  │
│  └─────────┘  └─────────┘  └─────────┘  └───────────┘  │
│                                                          │
│  Server Components → fetch data server-side              │
│  Client Components → interactivity (forms, modals, cart) │
│  Server Actions → mutations (create, update, delete)     │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ Drizzle ORM
                     │
┌────────────────────▼─────────────────────────────────────┐
│              NEON POSTGRESQL (Serverless)                 │
│                                                          │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐   │
│  │  users  │ │ products │ │ orders │ │ order_items  │   │
│  └─────────┘ └──────────┘ └────────┘ └──────────────┘   │
│              ┌────────────┐                               │
│              │ categories │                               │
│              └────────────┘                               │
└──────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. Server Components fetch data via Drizzle queries at render time
2. Client Components handle user interactivity (cart, forms, modals)
3. Server Actions handle mutations (form submissions, order placement)
4. Middleware protects routes based on user role from JWT

---

## 🗄 Database Schema

### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| name | VARCHAR(255) | User's display name |
| email | VARCHAR(255) UNIQUE | Login email |
| password_hash | TEXT | bcrypt hash (null for Google users) |
| role | ENUM('ADMIN','SELLER','BUYER') | Access level |
| image | TEXT | Avatar URL (Google OAuth) |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `categories`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| name | VARCHAR(255) UNIQUE | Category name |
| description | TEXT | Optional description |
| created_at | TIMESTAMP | |

### `products`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| name | VARCHAR(255) | Product name |
| sku | VARCHAR(100) UNIQUE | Stock Keeping Unit |
| description | TEXT | Product details |
| category_id | UUID (FK) | Reference to categories |
| dimension | ENUM('weight','volume','count') | Physical dimension |
| base_unit | ENUM('g','mL','unit') | Internal storage unit |
| **base_price** | **NUMERIC(20,6)** | **Price per 1 base unit in ₹** |
| **stock_quantity** | **NUMERIC(20,6)** | **Current stock in base units** |
| min_order_quantity | NUMERIC(20,6) | Minimum order in base units |
| is_active | BOOLEAN | Product availability |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `orders`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| order_number | VARCHAR(20) UNIQUE | Human-readable ID (ORD-YYYYMMDD-XXXX) |
| user_id | UUID (FK) | Buyer who placed the order |
| status | ENUM | PENDING/CONFIRMED/SHIPPED/DELIVERED/CANCELLED |
| **total_amount** | **NUMERIC(20,6)** | **Order total in ₹** |
| notes | TEXT | Buyer's notes |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `order_items`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| order_id | UUID (FK) | Reference to orders |
| product_id | UUID (FK) | Reference to products |
| **ordered_unit** | ENUM('g','kg','mL','L','unit') | **Unit buyer selected** |
| **ordered_quantity** | **NUMERIC(20,6)** | **Quantity in buyer's unit** |
| **base_quantity** | **NUMERIC(20,6)** | **Converted to base unit** |
| **unit_price** | **NUMERIC(20,6)** | **Price per ordered unit** |
| **total_price** | **NUMERIC(20,6)** | **Line item total** |
| created_at | TIMESTAMP | |

---

## ⚖️ Unit Conversion Strategy

### Base-Unit Normalization

All quantities and prices are stored internally in the **smallest practical base unit** for each physical dimension:

| Dimension | Base Unit (Internal) | Display Units | Conversion |
|-----------|---------------------|---------------|------------|
| **Weight** | gram (g) | g, kg | 1 kg = 1,000 g |
| **Volume** | milliliter (mL) | mL, L | 1 L = 1,000 mL |
| **Count** | unit | unit | 1:1 |

### Why This Strategy?

1. **Consistency**: All calculations use a single base unit per dimension
2. **Precision**: Avoid compounding conversion errors
3. **Simplicity**: One conversion factor per unit pair (always × or ÷ by 1000)
4. **Scalability**: Easy to add new units (e.g., mg, kL) by adding conversion factors

### Where Conversions Happen

| When | What | Direction |
|------|------|-----------|
| **Admin creates product** | Price entered as ₹ per base unit | No conversion needed |
| **Buyer browses products** | Price displayed per preferred unit (kg, L) | `base_price × 1000` for display |
| **Buyer adds to cart** | User enters qty in any unit | `qty × conversion_factor → base_qty` |
| **Price calculation** | `ordered_qty × conversion_factor × base_price` | Computed in real-time |
| **Order saved** | Both ordered_unit/qty AND base_qty stored | Conversion before DB write |
| **Admin reviews order** | Shows both units side-by-side | No conversion, both stored |

### Code Location

The conversion logic lives in `src/lib/units.ts`:

```typescript
// Convert user's quantity to base units
toBaseUnit(2, 'kg')   // → 2000 (grams)
toBaseUnit(0.5, 'L')  // → 500 (mL)

// Calculate price
calculatePrice(2, 'kg', 0.05)
// → 2 kg = 2000g × ₹0.05/g = ₹100.00

// Get price per display unit
getPricePerUnit('kg', 0.05)
// → ₹50.00 per kg (₹0.05/g × 1000)
```

---

## 💰 Price & Quantity Storage

### Data Type: `NUMERIC(20, 6)`

| Property | Value |
|----------|-------|
| Total digits | 20 |
| Decimal places | 6 |
| Max integer value | 99,999,999,999,999 (14 digits) |
| Smallest value | 0.000001 |

### Why NUMERIC over FLOAT/REAL?

- **NUMERIC is exact-precision** — no floating-point rounding errors
- Critical for financial calculations (INR amounts)
- Chemical quantities often involve very small or very large numbers
- FLOAT would introduce errors: `0.1 + 0.2 ≈ 0.30000000000000004`

### Rounding Rules

- **Internal storage**: Full 6 decimal precision
- **Display (INR)**: 2 decimal places for amounts ≥ ₹1, 4 decimal places for amounts < ₹1
- **Display (quantities)**: 2 decimal places normally, 4 for very small quantities

### Examples

| Product | Base Price | Base Unit | Display |
|---------|-----------|-----------|---------|
| Sodium Chloride | ₹0.050000/g | gram | ₹50.00/kg |
| Ethanol 99% | ₹0.080000/mL | mL | ₹80.00/L |
| Beaker Set | ₹450.000000/unit | unit | ₹450.00/unit |

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js 20+ and npm
- A [Neon](https://neon.tech) account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/assignment-round.git
cd assignment-round
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Neon Database

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project
3. Copy the connection string

### 4. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
AUTH_SECRET=your-random-secret-at-least-32-chars
AUTH_URL=http://localhost:3000

# Optional: Google OAuth
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

### 5. Push Schema to Database

```bash
npm run db:push
```

### 6. Seed the Database

```bash
npm run db:seed
```

This creates:
- 3 users (admin, seller, buyer)
- 5 categories
- 10 products with realistic chemical data

### 7. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🌐 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Select the repository
4. Add Environment Variables:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_URL` (your Vercel domain: `https://your-app.vercel.app`)
   - `AUTH_GOOGLE_ID` (optional)
   - `AUTH_GOOGLE_SECRET` (optional)
5. Deploy!

### Re-deploy

Push to main branch → Vercel auto-deploys.

---

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@asamedchem.com | Admin@123 |
| **Seller** | seller@asamedchem.com | Seller@123 |
| **Buyer** | buyer@asamedchem.com | Buyer@123 |

---

## 📖 User Guide

### 🛡️ Admin Panel (`/admin`)

1. **Dashboard**: Stats overview (products, orders, revenue)
2. **Products**: Create/edit/delete products, set base prices, manage stock
3. **Categories**: Organize products by category
4. **Orders**: View all orders, expand for full details, update status
5. **Inventory**: Stock levels, low-stock alerts, inventory value

### 🏪 Seller Panel (`/seller`)

1. **Dashboard**: Overview of products and orders
2. **Products**: View and manage product catalog
3. **Orders**: View and manage order status

### 🛒 Buyer Flow (`/shop`)

1. **Browse Products**: Search, filter by category/type, sort by name/price
2. **Add to Cart**: Click a product → select unit (g/kg/mL/L/unit) → enter quantity → see live price
3. **Cart**: Adjust quantities and units, see conversion breakdown, view order total
4. **Place Order**: Review summary → add notes → submit
5. **My Orders**: Track order status, view full breakdown

### 🎨 Theme Toggle

Click the sun/moon toggle in the sidebar or navbar to switch between light and dark mode. Your preference is saved automatically.

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin panel (dashboard, products, categories, orders, inventory)
│   ├── seller/             # Seller panel (dashboard, products, orders)
│   ├── shop/               # Buyer panel (browse, cart, orders)
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── api/                # API routes (auth, register)
├── components/             # React components (client-side)
├── db/                     # Database (schema, connection, seed)
├── lib/                    # Utilities (auth, units, format)
├── actions/                # Server Actions (products, orders)
├── types/                  # TypeScript type definitions
└── middleware.ts            # Route protection
```

---

## Design Decisions

1. **Server Actions over API routes**: Cleaner data flow, automatic revalidation, type-safe
2. **Drizzle ORM over Prisma**: Lighter bundle, better SQL control, native Neon support
3. **JWT sessions**: Stateless, no DB session table needed, fast on Vercel edge
4. **Base-unit normalization**: Single source of truth for quantities, predictable conversions
5. **NUMERIC(20,6)**: Exact precision for financial data, no floating-point surprises
6. **CSS custom properties**: Full theme control without utility-class bloat
7. **Client-side cart**: Fast UX, no DB writes until order placement

---

Built with ❤️ for AasaMedChem recruitment challenge.
