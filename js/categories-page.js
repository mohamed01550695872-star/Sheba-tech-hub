import { fetchCategories, fetchProducts, formatPrice } from '../supabase-client.js';

const categoryImages = {
  'laptops': 'https://images.pexels.com/photos/18311089/pexels-photo-18311089.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'smartphones': 'https://images.pexels.com/photos/30639091/pexels-photo-30639091.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'tablets': 'https://images.pexels.com/photos/18205642/pexels-photo-18205642.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'playstation': 'https://images.pexels.com/photos/4219885/pexels-photo-4219885.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'xbox': 'https://images.pexels.com/photos/5700769/pexels-photo-5700769.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'wearables': 'https://images.pexels.com/photos/31541678/pexels-photo-31541678.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'cameras': 'https://images.pexels.com/photos/27617054/pexels-photo-27617054.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'audio': 'https://images.pexels.com/photos/3921817/pexels-photo-3921817.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'accessories': 'https://images.pexels.com/photos/19055620/pexels-photo-19055620.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'pc-components': 'https://images.pexels.com/photos/7727496/pexels-photo-7727496.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'spare-parts': 'https://images.pexels.com/photos/38264265/pexels-photo-38264265.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};

function createCategoryTile(category, productCount) {
  const img = categoryImages[category.slug] || 'https://images.pexels.com/photos/7727496/pexels-photo-7727496.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
  return `
    <a href="products.html?category=${category.slug}" class="category-tile">
      <div class="cat-tile-image">
        <img src="${img}" alt="${category.name}" />
      </div>
      <span class="cat-tile-count">${productCount} item${productCount !== 1 ? 's' : ''}</span>
      <div class="cat-tile-body">
        <h4>${category.name}</h4>
        <p>${category.description || ''}</p>
      </div>
    </a>`;
}

async function init() {
  const grid = document.querySelector('.categories-page-grid');
  if (!grid) return;

  try {
    const [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);

    const countMap = {};
    products.forEach(function (p) {
      if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
    });

    grid.innerHTML = categories
      .map(function (cat) {
        const count = countMap[cat.id] || 0;
        return createCategoryTile(cat, count);
      })
      .join('');
  } catch (err) {
    grid.innerHTML = '<p style="padding:40px; text-align:center; color:var(--error);">Failed to load categories.</p>';
    console.error('Categories fetch error:', err);
  }
}

init();
