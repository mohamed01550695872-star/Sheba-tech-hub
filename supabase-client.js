import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_featured', true)
    .order('rating', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchProductsByCategorySlug(slug) {
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (!category) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchCategoryById(id) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createOrder(orderData) {
  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchOrderById(id) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function formatPrice(value) {
  if (value == null) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function renderStars(rating) {
  const num = typeof rating === 'string' ? parseFloat(rating) : (rating || 0);
  const full = Math.floor(num);
  const half = num - full >= 0.5;
  let stars = '';
  for (let i = 0; i < 5; i++) {
    if (i < full) stars += '★';
    else if (i === full && half) stars += '★';
    else stars += '☆';
  }
  return stars;
}

export function wireAddToCartButtons(container) {
  const buttons = (container || document).querySelectorAll('.add-to-cart-btn');
  buttons.forEach(function (btn) {
    if (btn.dataset.wired) return;
    btn.dataset.wired = 'true';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const product = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        brand: btn.dataset.brand || '',
        price: parseFloat(btn.dataset.price) || 0,
        image: btn.dataset.image || '',
      };
      if (typeof window.addToCart === 'function') {
        window.addToCart(product);
      } else {
        let cart = [];
        try { cart = JSON.parse(localStorage.getItem('sheba_cart') || '[]'); } catch { cart = []; }
        const existing = cart.find(function (item) { return item.id === product.id; });
        if (existing) { existing.qty += 1; } else { cart.push(Object.assign({ qty: 1 }, product)); }
        localStorage.setItem('sheba_cart', JSON.stringify(cart));
      }
      const original = btn.textContent;
      const originalBg = btn.style.background;
      btn.textContent = '✓ Added!';
      btn.style.background = '#16A34A';
      setTimeout(function () {
        btn.textContent = original;
        btn.style.background = originalBg;
      }, 1500);
    });
  });
}
