import { fetchProductById, fetchProducts, formatPrice, renderStars, wireAddToCartButtons } from '../supabase-client.js';

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function populateProductInfo(product) {
  const mainImg = document.querySelector('.main-image img');
  if (mainImg) {
    mainImg.src = product.image_url;
    mainImg.alt = product.name;
  }

  const thumbs = document.querySelectorAll('.thumbs .thumb img');
  thumbs.forEach(function (thumb, i) {
    if (i === 0) thumb.src = product.image_url;
  });

  const metaBrand = document.querySelector('.meta-brand');
  if (metaBrand) metaBrand.textContent = product.brand || '';

  const metaCat = document.querySelector('.meta-cat');
  if (metaCat && product.categories) metaCat.textContent = product.categories.name;

  const h1 = document.querySelector('.product-info h1');
  if (h1) h1.textContent = product.name;

  const ratingStars = document.querySelector('.product-rating .stars');
  if (ratingStars) ratingStars.textContent = renderStars(product.rating);

  const ratingText = document.querySelector('.product-rating span:last-child');
  if (ratingText) {
    const ratingNum = Math.floor(Math.random() * 300 + 50);
    ratingText.textContent = `${product.rating || '0'} out of 5 (${ratingNum} reviews)`;
  }

  const priceCurrent = document.querySelector('.price-current');
  if (priceCurrent) priceCurrent.textContent = formatPrice(product.price);

  const priceOld = document.querySelector('.price-old');
  if (priceOld) {
    if (product.old_price && parseFloat(product.old_price) > parseFloat(product.price)) {
      priceOld.textContent = formatPrice(product.old_price);
      priceOld.style.display = '';
    } else {
      priceOld.style.display = 'none';
    }
  }

  const priceSave = document.querySelector('.price-save');
  if (priceSave && product.old_price) {
    const save = parseFloat(product.old_price) - parseFloat(product.price);
    priceSave.textContent = 'Save ' + formatPrice(save);
    priceSave.style.display = '';
  } else if (priceSave) {
    priceSave.style.display = 'none';
  }

  const stockEl = document.querySelector('.product-stock');
  if (stockEl) {
    if (product.stock > 0) {
      stockEl.textContent = '● In Stock — Ships within 24 hours';
      stockEl.style.color = 'var(--success)';
    } else {
      stockEl.textContent = '● Out of Stock';
      stockEl.style.color = 'var(--error)';
    }
  }

  const descEl = document.querySelector('.product-desc');
  if (descEl && product.description) {
    descEl.textContent = product.description;
  }

  const breadcrumbName = document.querySelector('.breadcrumb span:last-child');
  if (breadcrumbName) breadcrumbName.textContent = product.name;

  const breadcrumbCat = document.querySelector('.breadcrumb a[href="categories.html"]');
  if (breadcrumbCat && product.categories) {
    breadcrumbCat.textContent = product.categories.name;
    breadcrumbCat.href = 'products.html?category=' + product.categories.slug;
  }

  const addToCartBtn = document.querySelector('.product-actions-row .btn-primary');
  if (addToCartBtn) {
    addToCartBtn.href = 'cart.html';
    addToCartBtn.setAttribute('data-id', product.id);
    addToCartBtn.setAttribute('data-name', product.name);
    addToCartBtn.setAttribute('data-brand', product.brand || '');
    addToCartBtn.setAttribute('data-price', product.price);
    addToCartBtn.setAttribute('data-image', product.image_url);
    addToCartBtn.classList.add('add-to-cart-btn');
  }

  const buyNowBtn = document.querySelector('.product-actions-row .btn-secondary');
  if (buyNowBtn) {
    buyNowBtn.href = 'checkout.html';
  }
}

function populateRelatedProducts(products, currentId) {
  const grid = document.querySelector('.related-products .products-grid');
  if (!grid) return;

  const related = products.filter(function (p) { return p.id !== currentId; }).slice(0, 4);
  if (related.length === 0) return;

  grid.innerHTML = related.map(function (product) {
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
          <div class="product-rating"><span class="stars">${renderStars(product.rating)}</span><span class="rating-text">${product.rating || '0'} (${ratingNum})</span></div>
          <div class="product-price"><span class="price-current">${formatPrice(product.price)}</span>${oldPriceHtml}</div>
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
  }).join('');

  wireAddToCartButtons(grid);
}

async function init() {
  const id = getProductIdFromUrl();
  if (!id) return;

  try {
    const [product, allProducts] = await Promise.all([
      fetchProductById(id),
      fetchProducts(),
    ]);

    if (!product) {
      const layout = document.querySelector('.product-details-layout');
      if (layout) {
        layout.innerHTML = '<p style="padding:48px; text-align:center; color:var(--error);">Product not found.</p>';
      }
      return;
    }

    populateProductInfo(product);
    populateRelatedProducts(allProducts, id);
    wireAddToCartButtons(document.querySelector('.product-actions-row'));
  } catch (err) {
    console.error('Product details fetch error:', err);
  }
}

init();
