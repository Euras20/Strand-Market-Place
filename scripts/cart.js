// Cart: badge, drawer, add / update / remove
async function loadCart() {
  const token = StorefrontAPI.getGuestToken();
  const headers = {};
  if (token) headers['X-Guest-Cart-Token'] = token;

  const json = await StorefrontAPI.api('/storefront/cart', { headers });
  if (json.guest_token) StorefrontAPI.setGuestToken(json.guest_token);
  return json;
}

async function addToCart(variantId, quantity = 1) {
  const token = StorefrontAPI.getGuestToken();
  const headers = {};
  if (token) headers['X-Guest-Cart-Token'] = token;

  const json = await StorefrontAPI.api('/storefront/cart/items', {
    method: 'POST',
    headers,
    body: JSON.stringify({ variant_id: variantId, quantity }),
  });

  if (json.guest_token) StorefrontAPI.setGuestToken(json.guest_token);
  return json;
}

function updateCartBadge(count, total) {
  document.querySelectorAll('[data-cart-count], #cart-badge, .cart-badge').forEach(el => {
    el.textContent = count;
    el.classList.toggle('hidden', count === 0);
    if (el.classList.contains('hidden') && count > 0) {
      el.classList.remove('hidden');
      el.classList.add('flex');
    }
  });
  if (total != null) {
    const label = window.StorefrontAPI?.formatPrice
      ? StorefrontAPI.formatPrice(total)
      : Number(total).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    document.querySelectorAll('[data-cart-total]').forEach(el => { el.textContent = label; });
    const drawerTotal = document.getElementById('cart-total');
    if (drawerTotal) drawerTotal.textContent = label;
  }
}

async function refreshCartBadge() {
  try {
    const data = await loadCart();
    const items = data.cart?.items || [];
    const count = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
    updateCartBadge(count, data.totals?.subtotal ?? 0);
    return data;
  } catch (err) {
    console.info('Cart API not available, badge stays local:', err.message);
    return null;
  }
}

async function syncCartDrawer() {
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!itemsEl) return null;

  try {
    const data = await loadCart();
    const items = data.cart?.items || [];
    const totals = data.totals || {};

    if (items.length === 0) {
      itemsEl.innerHTML = `<div class="text-center text-secondary py-12 flex flex-col items-center gap-3">
        <span class="material-symbols-outlined text-[48px] text-outline-variant">shopping_bag</span>
        <p class="font-body-md">Votre panier est vide</p>
      </div>`;
    } else {
      itemsEl.innerHTML = items.map(it => {
        const variant = it.variant || {};
        const name = variant.product?.name || variant.variant_name || variant.sku || 'Produit';
        const price = it.unit_price ?? variant.price ?? 0;
        const qty = it.quantity || 1;
        const img = StorefrontAPI.mediaUrl?.(variant.media?.[0]) || '';
        return `
          <div class="flex gap-3 p-3 bg-surface-container-low rounded-lg">
            <div class="w-16 h-16 rounded-lg overflow-hidden bg-surface-container shrink-0">
              ${img ? `<img src="${img}" alt="" class="w-full h-full object-cover"/>` : ''}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-title-md text-title-md text-on-surface leading-tight">${name}</div>
              <div class="flex items-center justify-between mt-2">
                <div class="flex items-center bg-surface-container-lowest rounded-lg">
                  <button class="w-7 h-7 flex items-center justify-center hover:bg-surface-container rounded-l-lg" onclick="StorefrontAPI.updateCartItem(${it.id}, ${qty - 1})" type="button">−</button>
                  <span class="w-8 text-center font-numeric-data text-[13px] font-bold">${qty}</span>
                  <button class="w-7 h-7 flex items-center justify-center hover:bg-surface-container rounded-r-lg" onclick="StorefrontAPI.updateCartItem(${it.id}, ${qty + 1})" type="button">+</button>
                </div>
                <div class="text-right"><div class="font-title-md font-bold">${StorefrontAPI.formatPrice(price * qty)}</div></div>
              </div>
            </div>
            <button class="text-secondary hover:text-error self-start" onclick="StorefrontAPI.removeCartItem(${it.id})" type="button">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>`;
      }).join('');
    }

    if (totalEl) totalEl.textContent = StorefrontAPI.formatPrice(totals.subtotal || totals.total || 0);
    updateCartBadge(items.reduce((s, i) => s + (i.quantity || 1), 0));
    return data;
  } catch (err) {
    console.info('Server cart drawer not available, local drawer remains:', err.message);
    return null;
  }
}

async function updateCartItem(itemId, quantity) {
  const token = StorefrontAPI.getGuestToken();
  const headers = {};
  if (token) headers['X-Guest-Cart-Token'] = token;

  if (quantity <= 0) return removeCartItem(itemId);

  await StorefrontAPI.api(`/storefront/cart/items/${itemId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ quantity }),
  });
  return syncCartDrawer();
}

async function removeCartItem(itemId) {
  const token = StorefrontAPI.getGuestToken();
  const headers = {};
  if (token) headers['X-Guest-Cart-Token'] = token;

  await StorefrontAPI.api(`/storefront/cart/items/${itemId}`, {
    method: 'DELETE',
    headers,
  });
  return syncCartDrawer();
}

window.StorefrontAPI = {
  ...window.StorefrontAPI,
  loadCart,
  addToCart,
  updateCartBadge,
  refreshCartBadge,
  syncCartDrawer,
  updateCartItem,
  removeCartItem,
};

document.addEventListener('DOMContentLoaded', () => {
  const openers = document.querySelectorAll('[data-path="panier"], [aria-label="Panier"], #cart-button');
  openers.forEach(el => {
    el.addEventListener('click', async (e) => {
      if (typeof syncCartDrawer === 'function') {
        e.preventDefault();
        await syncCartDrawer();
        const d = document.getElementById('cart-drawer');
        const b = document.getElementById('cart-drawer-backdrop');
        if (d) d.classList.remove('translate-x-full');
        if (b) b.classList.remove('hidden');
      }
    });
  });
  if (typeof refreshCartBadge === 'function') refreshCartBadge();
});
