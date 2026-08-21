/*
# Seed additional categories and products

1. New Data
- Adds 5 missing categories to match the frontend: Tablets, PlayStation, Xbox, Accessories, PC Components, Spare Parts
- Adds 8 new products across the new categories to match what the frontend displays
2. Security
- No security changes. RLS already enabled with anon policies on all tables.
3. Important Notes
- Existing categories (Laptops, Phones, Audio, Wearables, Cameras) are kept as-is.
- "Phones" category is renamed to "Smartphones" to match the frontend.
- Products use the same Pexels image URLs already shown in the frontend.
*/

-- Rename "Phones" to "Smartphones" to match frontend
UPDATE categories SET name = 'Smartphones', description = 'Flagship, mid-range & budget phones' WHERE slug = 'phones';

-- Insert missing categories
INSERT INTO categories (name, slug, description) VALUES
  ('Tablets', 'tablets', 'iPad, Android & Windows tablets'),
  ('PlayStation', 'playstation', 'Consoles, games & accessories'),
  ('Xbox', 'xbox', 'Consoles, controllers & games'),
  ('Accessories', 'accessories', 'Keyboards, mice, headphones & more'),
  ('PC Components', 'pc-components', 'GPU, CPU, RAM, motherboard & more'),
  ('Spare Parts', 'spare-parts', 'Screens, batteries, ports & internals')
ON CONFLICT (slug) DO NOTHING;

-- Insert additional products
INSERT INTO products (name, brand, description, price, old_price, image_url, category_id, stock, rating, is_featured) VALUES
  (
    'PlayStation 5 Pro',
    'Sony',
    'Next-gen gaming console with 4K gaming and 1TB storage',
    699.00,
    NULL,
    'https://images.pexels.com/photos/4219885/pexels-photo-4219885.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    (SELECT id FROM categories WHERE slug = 'playstation'),
    30,
    5.0,
    true
  ),
  (
    'Xbox Series X',
    'Microsoft',
    'Powerful next-gen console with 1TB SSD and 4K gaming',
    599.00,
    NULL,
    'https://images.pexels.com/photos/5700769/pexels-photo-5700769.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    (SELECT id FROM categories WHERE slug = 'xbox'),
    25,
    4.8,
    true
  ),
  (
    'iPad Pro 12.9',
    'Apple',
    'Powerful tablet with M2 chip and Liquid Retina display',
    1099.00,
    1299.00,
    'https://images.pexels.com/photos/18205642/pexels-photo-18205642.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    (SELECT id FROM categories WHERE slug = 'tablets'),
    18,
    4.9,
    false
  ),
  (
    'Gaming Mouse RGB',
    'Logitech',
    'High-precision gaming mouse with customizable RGB lighting',
    79.00,
    99.00,
    'https://images.pexels.com/photos/19055620/pexels-photo-19055620.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    (SELECT id FROM categories WHERE slug = 'accessories'),
    80,
    4.6,
    false
  ),
  (
    'RTX 4070 Graphics Card',
    'NVIDIA',
    'High-performance GPU for gaming and content creation',
    599.00,
    699.00,
    'https://images.pexels.com/photos/7727496/pexels-photo-7727496.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    (SELECT id FROM categories WHERE slug = 'pc-components'),
    12,
    4.9,
    false
  ),
  (
    'Phone Screen Replacement Kit',
    'Universal',
    'Screen replacement kit for most smartphone models',
    49.00,
    NULL,
    'https://images.pexels.com/photos/38264265/pexels-photo-38264265.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    (SELECT id FROM categories WHERE slug = 'spare-parts'),
    50,
    4.2,
    false
  ),
  (
    'Galaxy Tab S9',
    'Samsung',
    'Premium Android tablet with S Pen included',
    799.00,
    899.00,
    'https://images.pexels.com/photos/341523/pexels-photo-341523.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    (SELECT id FROM categories WHERE slug = 'tablets'),
    15,
    4.7,
    false
  ),
  (
    'PlayStation 5 DualSense Controller',
    'Sony',
    'Wireless controller with haptic feedback and adaptive triggers',
    69.00,
    79.00,
    'https://images.pexels.com/photos/4219885/pexels-photo-4219885.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    (SELECT id FROM categories WHERE slug = 'accessories'),
    100,
    4.8,
    false
  )
ON CONFLICT DO NOTHING;
