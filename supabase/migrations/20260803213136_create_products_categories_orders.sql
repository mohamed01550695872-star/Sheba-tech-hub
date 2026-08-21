/*
# Create products, categories, and orders tables

## Overview
This migration creates the core e-commerce schema for Sheba Tech Hub — an electronics
storefront. Three entities are created: categories, products, and orders.

## 1. New Tables

### categories
- `id` (uuid, primary key)
- `name` (text, not null) — category display name (e.g. "Laptops", "Phones")
- `slug` (text, unique, not null) — URL-friendly identifier
- `description` (text) — optional longer description
- `created_at` (timestamptz, defaults to now)

### products
- `id` (uuid, primary key)
- `name` (text, not null) — product name
- `brand` (text) — manufacturer brand
- `description` (text) — product details
- `price` (numeric(10,2), not null) — current selling price
- `old_price` (numeric(10,2)) — original price for discount display
- `image_url` (text) — product image URL
- `category_id` (uuid, FK → categories.id, ON DELETE SET NULL)
- `stock` (integer, default 0) — inventory count
- `rating` (numeric(2,1), default 0) — average rating 0–5
- `is_featured` (boolean, default false) — show on homepage
- `created_at` (timestamptz, defaults to now)

### orders
- `id` (uuid, primary key)
- `customer_name` (text, not null)
- `customer_email` (text, not null)
- `customer_phone` (text)
- `shipping_address` (text, not null)
- `items` (jsonb, not null) — array of {product_id, name, price, quantity}
- `total` (numeric(10,2), not null) — order total
- `status` (text, default 'pending') — pending / confirmed / shipped / delivered / cancelled
- `created_at` (timestamptz, defaults to now)

## 2. Indexes
- `products.category_id` — for filtering by category
- `products.is_featured` — for homepage queries
- `categories.slug` — unique index for slug lookups
- `orders.status` — for filtering orders by status

## 3. Security (RLS)
This is a single-tenant app with no sign-in screen. All three tables use
`TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` because
the storefront data is intentionally public/shared — any visitor can browse
products, categories, and place orders.
- categories: anon+authenticated full CRUD
- products: anon+authenticated full CRUD
- orders: anon+authenticated full CRUD
*/

-- ---------- categories ----------
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE
  TO anon, authenticated USING (true);

-- ---------- products ----------
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  description text,
  price numeric(10,2) NOT NULL,
  old_price numeric(10,2),
  image_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  stock integer NOT NULL DEFAULT 0,
  rating numeric(2,1) DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

-- ---------- orders ----------
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  shipping_address text NOT NULL,
  items jsonb NOT NULL,
  total numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE
  TO anon, authenticated USING (true);

-- ---------- indexes ----------
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);