import { fetchProducts, formatPrice, renderStars, wireAddToCartButtons } from '../supabase-client.js';

function createMarketplaceCard(product) {
  const hasDiscount = product.old_price && parseFloat(product.old_price) > parseFloat(product.price);
  const oldPriceHtml = hasDiscount
    ? `<span class="price-old">${formatPrice(product.old_price)}</span>`
    : '';
  const condition = ['Like New', 'Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 4)];
  const conditionColor = condition === 'Like New' ? 'var(--secondary-dark)' :
    condition === 'Good' ? 'var(--success)' :
    condition === 'Excellent' ? 'var(--success)' : 'var(--warning)';
  const ratingNum = Math.floor(Math.random() * 50 + 10);

  return `
    <div class="product-card">
      <div class="product-image">
        <img src="${product.image_url}" alt="${product.name}" />
        <div class="product-badge"><span class="badge-new" style="background:var(--secondary);">USED</span></div>
        <button class="wishlist-btn">♥</button>
      </div>
      <div class="product-body">
        <p class="product-brand">${product.brand || ''}</p>
        <h4 class="product-name">${product.name}</h4>
        <div class="product-rating"><span class="stars">${renderStars(product.rating)}</span><span class="rating-text">${product.rating || '0'} (${ratingNum})</span></div>
        <div class="product-price"><span class="price-current">${formatPrice(product.price)}</span>${oldPriceHtml}</div>
        <div class="stock-status" style="color:${conditionColor};">● ${condition} Condition</div>
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
  const grid = document.querySelector('.section .products-grid');
  if (!grid) return;

  const section = grid.closest('.section');
  if (!section) return;
  const header = section.querySelector('.section-header h2');
  if (header && header.textContent.indexOf('Used Devices') === -1) return;

  try {
    const products = await fetchProducts();
    if (!products || products.length === 0) {
      grid.innerHTML = '<p style="padding:40px; text-align:center; color:var(--text-muted);">No used devices available yet.</p>';
      return;
    }
    grid.innerHTML = products.slice(0, 4).map(createMarketplaceCard).join('');
    wireAddToCartButtons(grid);
  } catch (err) {
    grid.innerHTML = '<p style="padding:40px; text-align:center; color:var(--error);">Failed to load devices.</p>';
    console.error('Marketplace fetch error:', err);
  }
}

init();
