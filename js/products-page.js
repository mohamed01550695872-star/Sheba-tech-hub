import { fetchProducts, formatPrice, renderStars, wireAddToCartButtons } from '../supabase-client.js';

function createProductCard(product) {
  const hasDiscount = product.old_price && parseFloat(product.old_price) > parseFloat(product.price);
  const discountPercent = hasDiscount
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.old_price)) * 100)
    : 0;
  const badge = hasDiscount
    ? `<span class="badge-sale">-${discountPercent}%</span>`
    : `<span class="badge-new">NEW</span>`;
  const oldPriceHtml = hasDiscount
    ? `<span class="price-old">${formatPrice(product.old_price)}</span>`
    : '';
  const stockClass = product.stock > 0 ? 'stock-in' : 'stock-out';
  const stockText = product.stock > 0 ? '● In Stock' : '● Out of Stock';
  const ratingNum = Math.floor(Math.random() * 300 + 50);

  return `
    <div class="product-card">
      <div class="product-image">
        <img src="${product.image_url}" alt="${product.name}" />
        <div class="product-badge">${badge}</div>
        <button class="wishlist-btn">♥</button>
      </div>
      <div class="product-body">
        <p class="product-brand">${product.brand || ''}</p>
        <h4 class="product-name">${product.name}</h4>
        <div class="product-rating">
          <span class="stars">${renderStars(product.rating)}</span>
          <span class="rating-text">${product.rating || '0'} (${ratingNum})</span>
        </div>
        <div class="product-price">
          <span class="price-current">${formatPrice(product.price)}</span>
          ${oldPriceHtml}
        </div>
        <div class="stock-status ${stockClass}">${stockText}</div>
        <div class="product-actions">
          <button class="btn btn-primary btn-sm add-to-cart-btn"
            data-id="${product.id}"
            data-name="${product.name}"
            data-brand="${product.brand || ''}"
            data-price="${product.price}"
            data-image="${product.image_url}">Add to Cart</button>
          <a href="product-details.html?id=${product.id}" class="btn btn-ghost btn-sm">View</a>
        </div>
      </div>
    </div>`;
}

async function init() {
  const grid = document.querySelector('.products-main .products-grid');
  if (!grid) return;

  try {
    const products = await fetchProducts();
    if (!products || products.length === 0) {
      grid.innerHTML = '<p style="padding:40px; text-align:center; color:var(--text-muted);">No products available yet.</p>';
      return;
    }
    grid.innerHTML = products.map(createProductCard).join('');
    wireAddToCartButtons(grid);

    const countEl = document.querySelector('.result-count');
    if (countEl) {
      countEl.textContent = `Showing 1–${products.length} of ${products.length} results`;
    }
  } catch (err) {
    grid.innerHTML = '<p style="padding:40px; text-align:center; color:var(--error);">Failed to load products. Please try again later.</p>';
    console.error('Products fetch error:', err);
  }
}

init();
