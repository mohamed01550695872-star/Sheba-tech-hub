import { fetchFeaturedProducts, formatPrice, renderStars, wireAddToCartButtons } from '../supabase-client.js';

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
        <button class="wishlist-btn" title="Add to Wishlist">♥</button>
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
          <a href="product-details.html?id=${product.id}" class="btn btn-ghost btn-sm">View Details</a>
        </div>
      </div>
    </div>`;
}

function createDealCard(product) {
  const hasDiscount = product.old_price && parseFloat(product.old_price) > parseFloat(product.price);
  const discountPercent = hasDiscount
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.old_price)) * 100)
    : 0;
  if (!hasDiscount) return '';
  const ratingNum = Math.floor(Math.random() * 300 + 50);

  return `
    <div class="deal-card">
      <div class="deal-image">
        <img src="${product.image_url}" alt="${product.name}" />
        <span class="discount-badge">-${discountPercent}%</span>
      </div>
      <div class="deal-body">
        <h4 class="deal-name">${product.name}</h4>
        <p class="deal-brand">${product.brand || ''}</p>
        <div class="deal-prices">
          <span class="price-original">${formatPrice(product.old_price)}</span>
          <span class="price-discount">${formatPrice(product.price)}</span>
        </div>
        <div class="rating">
          <span class="stars">${renderStars(product.rating)}</span>
          <span class="rating-num">(${ratingNum})</span>
        </div>
        <div class="deal-actions">
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
  try {
    const products = await fetchFeaturedProducts();
    if (!products || products.length === 0) return;

    const productsGrid = document.querySelector('.section-blue .products-grid');
    if (productsGrid) {
      productsGrid.innerHTML = products.slice(0, 4).map(createProductCard).join('');
      wireAddToCartButtons(productsGrid);
    }

    const dealsGrid = document.querySelector('.section-light .deals-grid');
    if (dealsGrid) {
      const discounted = products.filter(function (p) {
        return p.old_price && parseFloat(p.old_price) > parseFloat(p.price);
      });
      dealsGrid.innerHTML = discounted.slice(0, 4).map(createDealCard).join('');
      wireAddToCartButtons(dealsGrid);
    }
  } catch (err) {
    console.error('Home page fetch error:', err);
  }
}

init();
