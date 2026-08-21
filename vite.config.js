import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        products: resolve(__dirname, 'products.html'),
        categories: resolve(__dirname, 'categories.html'),
        marketplace: resolve(__dirname, 'marketplace.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        cart: resolve(__dirname, 'cart.html'),
        productDetails: resolve(__dirname, 'product-details.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        ai: resolve(__dirname, 'ai.html'),
        maintenance: resolve(__dirname, 'maintenance.html'),
        modules: resolve(__dirname, 'modules.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
        forgotPassword: resolve(__dirname, 'forgot-password.html'),
      },
    },
  },
});
