// Shared Cart Logic for Strand Marketplace
// Include this script on category.html, product.html, strand.html, checkout.html

const CART_KEY = 'strand_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

function addToCart(product) {
  // product = { id, name, price, image, sku, qty }
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += product.qty || 1;
  } else {
    cart.push({ ...product, qty: product.qty || 1 });
  }
  saveCart(cart);
  showCartToast(product.name);
  return cart;
}

function removeFromCart(id) {
  const cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
}

function updateQty(id, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty = Math.max(1, qty);
    saveCart(cart);
  }
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function formatPrice(n) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function updateCartUI() {
  const cart = getCart();
  const count = getCartCount();
  const total = getCartTotal();

  // Update navbar badges
  document.querySelectorAll('[data-path="panier"] .rounded-full, .cart-count').forEach(el => {
    el.textContent = count;
  });
  document.querySelectorAll('[data-path="panier"] .font-numeric-data, .cart-total-header').forEach(el => {
    el.textContent = formatPrice(total);
  });

  // Update cart drawer content
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<div class="text-center text-secondary py-8">Votre panier est vide</div>';
    if (totalEl) totalEl.textContent = '0,00 €';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="flex gap-3 p-3 bg-surface-container-low rounded-lg">
      <img src="${item.image || 'https://via.placeholder.com/64'}" class="w-16 h-16 rounded object-cover" alt="" />
      <div class="flex-1 min-w-0">
        <div class="font-medium text-sm truncate">${item.name}</div>
        <div class="text-xs text-secondary">${item.sku || ''}</div>
        <div class="flex items-center justify-between mt-2">
          <div class="flex items-center gap-2">
            <button onclick="updateQty('${item.id}', ${item.qty - 1})" class="w-6 h-6 rounded bg-surface-container text-sm">−</button>
            <span class="text-sm font-medium">${item.qty}</span>
            <button onclick="updateQty('${item.id}', ${item.qty + 1})" class="w-6 h-6 rounded bg-surface-container text-sm">+</button>
          </div>
          <div class="text-right">
            <div class="font-semibold text-sm">${formatPrice(item.price * item.qty)}</div>
            <button onclick="removeFromCart('${item.id}')" class="text-xs text-error hover:underline">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  if (totalEl) totalEl.textContent = formatPrice(total);
}

function showCartToast(name) {
  // Simple toast if element exists, otherwise alert-free
  const toast = document.getElementById('toast-notification');
  if (toast) {
    const title = document.getElementById('toast-title');
    const desc = document.getElementById('toast-desc') || document.getElementById('toast-message');
    if (title) title.textContent = 'Ajouté au panier';
    if (desc) desc.textContent = name;
    toast.classList.remove('translate-x-full', 'translate-y-24', 'opacity-0');
    toast.classList.add('translate-x-0', 'translate-y-0', 'opacity-100');
    setTimeout(() => {
      toast.classList.add('translate-x-full', 'opacity-0');
      toast.classList.remove('translate-x-0', 'opacity-100');
    }, 2500);
  }
}

function goToCheckout() {
  if (getCartCount() === 0) {
    alert('Votre panier est vide');
    return;
  }
  window.location.href = 'checkout.html';
}

// Auto-init on load
document.addEventListener('DOMContentLoaded', updateCartUI);

// Expose globally
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQty = updateQty;
window.getCart = getCart;
window.getCartTotal = getCartTotal;
window.goToCheckout = goToCheckout;
window.updateCartUI = updateCartUI;
