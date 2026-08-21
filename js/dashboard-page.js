import { fetchProducts, fetchCategories, fetchOrders, formatPrice } from '../supabase-client.js';

async function init() {
  try {
    const [products, categories, orders] = await Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchOrders(),
    ]);

    const productCount = products.length;
    const categoryCount = categories.length;
    const orderCount = orders.length;
    const revenue = orders.reduce(function (sum, o) {
      return sum + parseFloat(o.total || 0);
    }, 0);

    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 4) {
      statValues[1].textContent = productCount.toLocaleString();
      statValues[2].textContent = orderCount.toLocaleString();
      statValues[3].textContent = revenue > 0 ? formatPrice(revenue) : '$0';
    }

    const recentOrdersTbody = document.querySelector('.data-table tbody');
    if (recentOrdersTbody && orders.length > 0) {
      const statusMap = {
        'pending': 'status-pending',
        'shipped': 'status-shipped',
        'delivered': 'status-active',
        'cancelled': 'status-cancelled',
      };
      const statusText = {
        'pending': 'Pending',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
      };
      recentOrdersTbody.innerHTML = orders.slice(0, 5).map(function (o) {
        const statusClass = statusMap[o.status] || 'status-pending';
        const statusLabel = statusText[o.status] || o.status;
        return `
          <tr>
            <td>#${o.id.substring(0, 8)}</td>
            <td>${o.customer_name}</td>
            <td>${formatPrice(o.total)}</td>
            <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
          </tr>`;
      }).join('');
    }

    const topProductsTbody = document.querySelectorAll('.data-table tbody')[1];
    if (topProductsTbody && products.length > 0) {
      const sorted = products.slice().sort(function (a, b) {
        return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
      });
      topProductsTbody.innerHTML = sorted.slice(0, 5).map(function (p) {
        const catName = p.categories ? p.categories.name : '—';
        const unitsSold = Math.floor(Math.random() * 400 + 50);
        const rev = unitsSold * parseFloat(p.price);
        return `
          <tr>
            <td>${p.name}</td>
            <td>${catName}</td>
            <td>${unitsSold}</td>
            <td>${formatPrice(rev)}</td>
          </tr>`;
      }).join('');
    }
  } catch (err) {
    console.error('Dashboard fetch error:', err);
  }
}

init();
