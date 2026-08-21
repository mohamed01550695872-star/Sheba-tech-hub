import { createOrder, formatPrice } from '../supabase-client.js';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('sheba_cart') || '[]');
  } catch {
    return [];
  }
}

function renderOrderSummary() {
  const cart = getCart();
  const summaryEl = document.querySelector('.order-summary');
  if (!summaryEl) return;

  if (cart.length === 0) {
    summaryEl.innerHTML = `
      <h3>Order Summary</h3>
      <p style="padding:24px 0; text-align:center; color:var(--text-muted);">Your cart is empty. <a href="products.html">Browse products</a></p>`;
    return;
  }

  let subtotal = 0;
  const itemsHtml = cart.map(function (item) {
    const qty = item.qty || item.quantity || 1;
    const lineTotal = item.price * qty;
    subtotal += lineTotal;
    return `
      <div class="order-item">
        <img src="${item.image || ''}" alt="${item.name}" />
        <div class="order-item-info">
          <h5>${item.name}</h5>
          <p>Qty: ${qty} × ${formatPrice(item.price)}</p>
        </div>
        <div class="order-item-price">${formatPrice(lineTotal)}</div>
      </div>`;
  }).join('');

  const discount = subtotal > 500 ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const shipping = subtotal > 500 ? 0 : 15;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const grandTotal = Math.round((subtotal - discount + shipping + tax) * 100) / 100;

  summaryEl.innerHTML = `
    <h3>Order Summary</h3>
    ${itemsHtml}
    <div class="summary-divider"></div>
    <div class="summary-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
    ${discount > 0 ? `<div class="summary-row discount"><span>Discount</span><span>−${formatPrice(discount)}</span></div>` : ''}
    <div class="summary-row shipping"><span>Shipping</span><span>${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
    <div class="summary-row"><span>Tax (8%)</span><span>${formatPrice(tax)}</span></div>
    <div class="summary-divider"></div>
    <div class="summary-total"><span>Grand Total</span><span>${formatPrice(grandTotal)}</span></div>
    ${subtotal > 500 ? '<div class="alert alert-success" style="margin-top:16px; font-size:0.8rem;">✓ Free shipping applied on orders over $500</div>' : ''}
  `;

  return { subtotal, discount, shipping, tax, grandTotal };
}

async function handleSubmit(e) {
  e.preventDefault();
  const cart = getCart();
  if (cart.length === 0) {
    alert('Your cart is empty. Please add products before checking out.');
    return;
  }

  const fname = document.getElementById('fname').value.trim();
  const lname = document.getElementById('lname').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const zip = document.getElementById('zip').value.trim();
  const country = document.getElementById('country').value;

  if (!fname || !lname || !email || !address || !city) {
    alert('Please fill in all required fields.');
    return;
  }

  const termsCheck = document.getElementById('terms-check');
  if (termsCheck && !termsCheck.checked) {
    alert('Please agree to the Terms of Service to confirm your order.');
    return;
  }

  let subtotal = 0;
  const items = cart.map(function (item) {
    const qty = item.qty || item.quantity || 1;
    subtotal += item.price * qty;
    return {
      id: item.id,
      name: item.name,
      brand: item.brand || '',
      price: item.price,
      quantity: qty,
      image: item.image || '',
    };
  });

  const discount = subtotal > 500 ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const shipping = subtotal > 500 ? 0 : 15;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const grandTotal = Math.round((subtotal - discount + shipping + tax) * 100) / 100;

  const orderData = {
    customer_name: fname + ' ' + lname,
    customer_email: email,
    customer_phone: phone || null,
    shipping_address: address + ', ' + city + ', ' + zip + ', ' + country,
    items: items,
    total: grandTotal,
    status: 'pending',
  };

  const submitBtn = document.querySelector('.checkout-form .btn-primary');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Placing Order...';
  }

  try {
    const order = await createOrder(orderData);
    localStorage.removeItem('sheba_cart');
    window.location.href = 'checkout.html?success=' + order.id;
  } catch (err) {
    alert('Failed to place order: ' + (err.message || 'Unknown error'));
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Order';
    }
  }
}

function showSuccessMessage() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('success');
  if (!orderId) return;

  const form = document.querySelector('.checkout-form');
  if (form) {
    form.innerHTML = `
      <div style="text-align:center; padding:48px 24px;">
        <div style="font-size:4rem; margin-bottom:16px;">✅</div>
        <h2>Order Placed Successfully!</h2>
        <p style="color:var(--text-muted); margin:12px 0 24px;">Your order #${orderId.substring(0, 8)} has been confirmed. We'll contact you at your email shortly.</p>
        <a href="products.html" class="btn btn-primary btn-lg">Continue Shopping</a>
      </div>`;
  }
}

async function init() {
  showSuccessMessage();
  if (document.querySelector('.checkout-form form') || document.querySelector('.checkout-form .btn-primary')) {
    renderOrderSummary();
    const confirmBtn = document.querySelector('.checkout-form .btn-primary');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', handleSubmit);
    }
  }
}

init();
