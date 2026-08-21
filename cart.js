/* ============================================
   SHEBA TECH HUB - CART MANAGEMENT
   Auto-wires ALL "Add to Cart" buttons/links
   Handles: add, remove, update quantity, totals
   Persists across pages via localStorage
   ============================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'sheba_cart';

  // ---- Storage helpers ----
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
  }

  function getCartCount(cart) {
    return cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
  }

  function getCartSubtotal(cart) {
    return cart.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);
  }

  function fmt(n) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Extract number from a price string like "$1,299" -> 1299
  function parsePrice(text) {
    var m = text.replace(/,/g, '').match(/[\d.]+/);
    return m ? parseFloat(m[0]) : 0;
  }

  // ---- Public API ----
  window.addToCart = function (product) {
    var cart = loadCart();
    var existing = cart.find(function (item) { return item.id === product.id; });
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        qty: 1
      });
    }
    saveCart(cart);
  };

  window.removeFromCart = function (id) {
    var cart = loadCart().filter(function (item) { return item.id !== id; });
    saveCart(cart);
    renderCartPage();
  };

  window.changeQty = function (id, delta) {
    var cart = loadCart();
    var item = cart.find(function (it) { return it.id === id; });
    if (!item) return;
    item.qty += delta;
    if (item.qty < 1) item.qty = 1;
    saveCart(cart);
    renderCartPage();
  };

  window.clearCart = function () {
    localStorage.removeItem(STORAGE_KEY);
    updateCartBadge();
    renderCartPage();
  };

  // ---- Badge update ----
  function updateCartBadge() {
    var cart = loadCart();
    var count = getCartCount(cart);
    var badges = document.querySelectorAll('.badge-count');
    // badges[0] = notifications, badges[1] = cart
    if (badges.length >= 2) {
      badges[1].textContent = count;
      badges[1].style.display = count > 0 ? 'flex' : 'none';
    }
  }

  // ---- Auto-wire ALL "Add to Cart" buttons ----
  // Finds every <a href="cart.html"> or <button> containing "Add to Cart"
  // and extracts product data from the parent .product-card or .deal-card
  function wireAllAddButtons() {
    // Selector: links to cart.html with "Add to Cart" text, or buttons with add-to-cart-btn class
    var candidates = document.querySelectorAll('a[href="cart.html"], .add-to-cart-btn, button[data-add-cart]');

    candidates.forEach(function (el) {
      var text = (el.textContent || '').trim();
      // Skip if it doesn't look like an add-to-cart button (e.g. "Proceed to Checkout")
      if (text.indexOf('Add to Cart') === -1 && text.indexOf('Add') === -1 && !el.classList.contains('add-to-cart-btn')) {
        return;
      }

      // Find parent card
      var card = el.closest('.product-card') || el.closest('.deal-card') || el.closest('.marketplace-card');

      // Extract product info from the card
      var name = '', brand = '', price = 0, image = '', id = '';

      if (card) {
        var nameEl = card.querySelector('.product-name, .deal-name, h4');
        name = nameEl ? nameEl.textContent.trim() : 'Product';

        var brandEl = card.querySelector('.product-brand, .deal-brand');
        brand = brandEl ? brandEl.textContent.trim() : '';

        var priceEl = card.querySelector('.price-current, .price-discount');
        price = priceEl ? parsePrice(priceEl.textContent) : 0;

        var imgEl = card.querySelector('img');
        image = imgEl ? imgEl.src : '';

        // Generate stable ID from name
        id = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || ('p' + Date.now());
      } else if (el.classList.contains('add-to-cart-btn')) {
        // Use data attributes if available
        name = el.getAttribute('data-name') || 'Product';
        brand = el.getAttribute('data-brand') || '';
        price = parseFloat(el.getAttribute('data-price')) || 0;
        image = el.getAttribute('data-image') || '';
        id = el.getAttribute('data-id') || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      }

      if (!name || price <= 0) return;

      // Replace the element with a button that adds to cart
      var btn = document.createElement('button');
      btn.className = el.className || 'btn btn-primary btn-sm';
      btn.textContent = 'Add to Cart';
      btn.setAttribute('data-product-id', id);

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        window.addToCart({ id: id, name: name, brand: brand, price: price, image: image });

        // Visual feedback
        var original = btn.textContent;
        var originalBg = btn.style.background;
        btn.textContent = '✓ Added!';
        btn.style.background = '#16A34A';
        setTimeout(function () {
          btn.textContent = original;
          btn.style.background = originalBg;
        }, 1500);
      });

      el.parentNode.replaceChild(btn, el);
    });
  }

  // ---- Render cart page ----
  function renderCartPage() {
    var container = document.getElementById('cart-items');
    if (!container) return;

    var cart = loadCart();

    if (cart.length === 0) {
      container.innerHTML =
        '<div class="empty-state">' +
        '<div class="empty-icon">🛒</div>' +
        '<h3>Your cart is empty</h3>' +
        '<p>Looks like you haven\'t added anything yet.</p>' +
        '<a href="products.html" class="btn btn-primary btn-lg">Browse Products</a>' +
        '</div>';
      updateSummary(0, 0, 0, 0, 0, 0);
      return;
    }

    var html = '';
    cart.forEach(function (item) {
      var lineTotal = item.price * item.qty;
      html +=
        '<div class="cart-item">' +
        '  <div class="cart-item-image">' +
        '    <img src="' + item.image + '" alt="' + item.name + '" />' +
        '  </div>' +
        '  <div class="cart-item-info">' +
        '    <h4>' + item.name + '</h4>' +
        '    <p class="item-brand">' + item.brand + '</p>' +
        '    <p class="item-price">' + fmt(item.price) + ' each</p>' +
        '  </div>' +
        '  <div class="cart-qty">' +
        '    <button type="button" onclick="changeQty(\'' + item.id + '\', -1)">−</button>' +
        '    <input type="text" value="' + item.qty + '" readonly />' +
        '    <button type="button" onclick="changeQty(\'' + item.id + '\', 1)">+</button>' +
        '  </div>' +
        '  <div class="cart-item-total">' + fmt(lineTotal) + '</div>' +
        '  <button class="remove-btn" title="Remove" onclick="removeFromCart(\'' + item.id + '\')">✕</button>' +
        '</div>';
    });

    html +=
      '<div style="margin-top:16px; display:flex; gap:8px; flex-wrap:wrap;">' +
      '  <a href="products.html" class="btn btn-ghost">← Continue Shopping</a>' +
      '  <button class="btn btn-ghost" onclick="clearCart()">Clear Cart</button>' +
      '</div>';

    container.innerHTML = html;

    var subtotal = getCartSubtotal(cart);
    var discount = subtotal > 500 ? subtotal * 0.1 : 0;
    var shipping = subtotal > 500 ? 0 : 15;
    var tax = (subtotal - discount) * 0.08;
    var grandTotal = subtotal - discount + shipping + tax;
    updateSummary(subtotal, discount, shipping, tax, grandTotal, getCartCount(cart));
  }

  function updateSummary(subtotal, discount, shipping, tax, grandTotal, count) {
    var set = function (id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set('sum-subtotal', fmt(subtotal));
    set('sum-discount', (discount > 0 ? '−' : '') + fmt(discount));
    set('sum-shipping', shipping === 0 ? 'FREE' : fmt(shipping));
    set('sum-tax', fmt(tax));
    set('sum-total', fmt(grandTotal));
    set('sum-count', count + ' item' + (count !== 1 ? 's' : ''));
  }

  // ---- Mobile nav toggle ----
  function wireNavToggle() {
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('navMenu');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('open');
      });
    }
  }

  // ---- Expandable search icon ----
  function wireSearchToggle() {
    var searchIcon = document.querySelector('.nav-search .search-icon');
    var searchBox = document.querySelector('.nav-search');
    var searchInput = document.querySelector('.nav-search input');
    if (!searchIcon || !searchBox) return;
    searchIcon.addEventListener('click', function () {
      searchBox.classList.toggle('expanded');
      if (searchBox.classList.contains('expanded') && searchInput) {
        searchInput.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (!searchBox.contains(e.target)) {
        searchBox.classList.remove('expanded');
      }
    });
  }

  // ---- Promo banner slider ----
  function wireSlider() {
    var track = document.getElementById('promoTrack');
    if (!track) return;
    var prevBtn = document.getElementById('promoPrev');
    var nextBtn = document.getElementById('promoNext');
    var dotsContainer = document.getElementById('promoDots');
    var slides = track.querySelectorAll('.promo-slide');
    if (slides.length === 0) return;

    var current = 0;
    var maxIndex = slides.length - 1;

    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      for (var i = 0; i <= maxIndex; i++) {
        (function (idx) {
          var dot = document.createElement('button');
          dot.className = 'dot' + (idx === 0 ? ' active' : '');
          dot.addEventListener('click', function () { goTo(idx); resetAutoPlay(); });
          dotsContainer.appendChild(dot);
        })(i);
      }
    }

    function updateDots() {
      if (!dotsContainer) return;
      var dots = dotsContainer.querySelectorAll('.dot');
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === current);
      });
    }

    function goTo(idx) {
      current = (idx + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      updateDots();
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); resetAutoPlay(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); resetAutoPlay(); });

    var autoTimer = null;
    var AUTO_INTERVAL = 4000;

    function startAutoPlay() {
      stopAutoPlay();
      autoTimer = setInterval(function () { goTo(current + 1); }, AUTO_INTERVAL);
    }

    function stopAutoPlay() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    var viewport = track.parentElement;
    if (viewport) {
      viewport.addEventListener('mouseenter', stopAutoPlay);
      viewport.addEventListener('mouseleave', startAutoPlay);
    }

    startAutoPlay();
  }

  // ---- Init ----
  document.addEventListener('DOMContentLoaded', function () {
    wireAllAddButtons();
    updateCartBadge();
    renderCartPage();
    wireNavToggle();
    wireSearchToggle();
    wireSlider();
  });
})();
