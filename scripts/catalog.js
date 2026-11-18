// Catalog: layout, categories, products
async function loadLayout() {
  try {
    const json = await StorefrontAPI.api('/storefront/layout');
    const data = json.data || json;

    const ann = document.getElementById('announcement');
    if (ann && data.header?.announcement) ann.textContent = data.header.announcement;

    const phoneEl = document.getElementById('store-phone');
    if (phoneEl && data.header?.phone) phoneEl.textContent = data.header.phone;

    const legal = document.getElementById('footer-legal');
    if (legal && data.footer?.legal_text) legal.textContent = data.footer.legal_text;

    document.querySelectorAll('[data-store-name]').forEach(el => {
      el.textContent = data.store?.name || el.textContent;
    });

    return data;
  } catch (err) {
    console.warn('Layout load failed:', err);
    return null;
  }
}

async function loadCategories(containerId = 'category-grid', options = {}) {
  const grid = document.getElementById(containerId);
  if (!grid) return;

  try {
    const json = await StorefrontAPI.api('/storefront/categories');
    let categories = json.data || json || [];
    if (!categories.length) return;
    const limit = options.limit;
    if (limit && limit > 0) categories = categories.slice(0, limit);
    grid.innerHTML = categories.map(cat => renderCategoryCard(cat, options)).join('');
  } catch (err) {
    console.warn('Categories load failed:', err);
  }
}

function renderCategoryCard(cat, options = {}) {
  const img = StorefrontAPI.mediaUrl(cat.image) || cat.image_url || StorefrontAPI.PLACEHOLDER;
  const name = cat.name || 'Collection';
  const slug = cat.slug || '';
  const page = options.page || 'category.html';
  const desc = cat.description || '';
  const count = cat.products_count ?? cat.count ?? null;

  return `
    <a class="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
       href="${page}?category=${encodeURIComponent(slug)}">
      <div class="relative aspect-[16/10] overflow-hidden bg-surface-container-low">
        <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${img}" alt="${name}" />
        ${count != null ? `<div class="absolute top-2 right-2 bg-white/90 text-xs font-semibold px-2 py-0.5 rounded">${count} réf.</div>` : ''}
      </div>
      <div class="p-space-md flex flex-col flex-1">
        <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-primary transition-colors">${name}</h3>
        ${desc ? `<p class="text-body-sm text-on-surface-variant mt-1 line-clamp-2">${desc}</p>` : ''}
        <span class="inline-flex items-center gap-1 mt-auto pt-space-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
          Explorer <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
        </span>
      </div>
    </a>
  `;
}


async function loadProducts(options = {}) {
  const {
    containerId = 'product-grid',
    category = null,
    sort = null,
    limit = null,
    page = null,
    minPrice = null,
    maxPrice = null,
    brand = null,
    q = null,
    inStock = false,
    promo = false,
    attrs = null,
  } = options;

  const grid = document.getElementById(containerId);
  const loading = document.getElementById(containerId + '-loading') || document.getElementById('products-loading');
  const empty = document.getElementById(containerId + '-empty') || document.getElementById('products-empty');
  const errorEl = document.getElementById(containerId + '-error') || document.getElementById('products-error');

  if (!grid) return;

  if (loading) loading.classList.remove('hidden');
  if (empty) empty.classList.add('hidden');
  if (errorEl) errorEl.classList.add('hidden');

  try {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    if (limit) params.set('limit', String(limit));
    if (page) params.set('page', String(page));
    if (minPrice != null) params.set('min_price', String(minPrice));
    if (maxPrice != null) params.set('max_price', String(maxPrice));
    if (brand) params.set('brand', brand);
    if (q) params.set('q', q);
    if (inStock) params.set('in_stock', '1');
    if (promo) params.set('promo', '1');
    if (attrs && typeof attrs === 'object') {
      Object.entries(attrs).forEach(([code, value]) => {
        if (value != null && value !== '') params.set(`attr[${code}]`, value);
      });
    }

    const qs = params.toString();
    const path = '/storefront/products' + (qs ? `?${qs}` : '');

    const json = await StorefrontAPI.api(path);
    const list = Array.isArray(json) ? json : (json.data || []);

    if (!list.length) {
      if (empty) empty.classList.remove('hidden');
      return;
    }

    grid.innerHTML = list.map(p => renderProductCard(p)).join('');

    // Pagination
    const pag = document.getElementById(containerId + '-pagination') || document.getElementById('pagination');
    if (pag && json.current_page) {
      const cur = json.current_page;
      const last = json.last_page;
      let html = '';
      if (cur > 1) html += `<button onclick="window.loadCategoryPage && window.loadCategoryPage(${cur-1})" class="px-4 py-2 border rounded">Précédent</button>`;
      html += `<span class="px-4 py-2">Page ${cur} / ${last}</span>`;
      if (cur < last) html += `<button onclick="window.loadCategoryPage && window.loadCategoryPage(${cur+1})" class="px-4 py-2 border rounded">Suivant</button>`;
      pag.innerHTML = html;
      pag.classList.remove('hidden');
    }
  } catch (err) {
    console.error(err);
    if (errorEl) {
      errorEl.textContent = 'Impossible de charger les produits.';
      errorEl.classList.remove('hidden');
    }
  } finally {
    if (loading) loading.classList.add('hidden');
  }
}

function renderProductCard(product) {
  const img = StorefrontAPI.mediaUrl(product.media?.[0]) || product.image || StorefrontAPI.PLACEHOLDER;
  const variant = product.variants?.[0] || {};
  const price = variant.price ?? product.price ?? 0;
  const compare = variant.compare_at_price ?? product.compare_at_price ?? null;
  const name = product.name || 'Produit';
  const slug = product.slug || product.id;
  const brand = product.brand?.name || product.brand_name || '';
  const discount = (compare && compare > price) ? Math.round((1 - price / compare) * 100) : null;
  const inStock = variant.inventory ? (variant.inventory.on_hand - variant.inventory.reserved) > 0 : true;
  const stockLabel = inStock ? 'En stock' : 'Sur commande';
  const href = `product.html?slug=${encodeURIComponent(slug)}`;

  return `
    <div class="bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col p-space-md justify-between group" onclick="window.location.href='${href}'" style="cursor:pointer">
      <div>
        <div class="relative w-full aspect-[4/3] bg-surface-container-low rounded-lg overflow-hidden">
          <img class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" src="${img}" alt="${name}" />
          ${discount ? `<div class="absolute top-2 left-2"><span class="px-2 py-0.5 bg-primary text-on-primary font-label-caps text-label-caps rounded font-bold">-${discount}%</span></div>` : ''}
          <button aria-label="Favoris" class="absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 hover:bg-surface-container-lowest text-secondary flex items-center justify-center shadow-sm" onclick="event.stopPropagation();" type="button">
            <span class="material-symbols-outlined text-[18px]">favorite</span>
          </button>
        </div>
        <div class="mt-space-sm">
          <div class="flex items-center justify-between text-secondary font-label-caps text-label-caps uppercase">
            <span>${brand}</span>
            <span class="text-tertiary flex items-center gap-0.5"><span class="w-1.5 h-1.5 rounded-full bg-tertiary"></span> ${stockLabel}</span>
          </div>
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1 leading-snug">${name}</h3>
          ${(() => {
            const chars = (product.attribute_values || product.attributeValues || [])
              .map(av => av.value_text ?? av.value_integer ?? av.value_decimal ?? '')
              .filter(Boolean)
              .slice(0, 3);
            if (!chars.length) return '';
            return `<div class="flex flex-wrap gap-1.5 mt-2">${chars.map(c => `<span class="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[11px] rounded">${c}</span>`).join('')}</div>`;
          })()}
        </div>
      </div>
      <div class="mt-space-md">
        <div class="flex items-baseline gap-2 mb-space-sm">
          <span class="font-headline-sm text-headline-sm text-on-surface font-bold">${StorefrontAPI.formatPrice(price)} HT</span>
          ${compare ? `<span class="text-on-surface-variant line-through text-body-sm">${StorefrontAPI.formatPrice(compare)} HT</span>` : ''}
        </div>
        <div class="flex gap-2">
          <button class="flex-1 bg-primary text-on-primary rounded-lg py-2.5 font-semibold hover:bg-primary-container transition-colors" onclick="event.stopPropagation(); window.quickBuy && window.quickBuy('${variant.id || ''}', '${slug}')" type="button">Acheter</button>
          <button class="w-11 h-11 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors" onclick="event.stopPropagation(); window.quickAddToCart && window.quickAddToCart('${variant.id || ''}')" type="button">
            <span class="material-symbols-outlined text-[20px]">shopping_bag</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  loadLayout();
});

window.StorefrontAPI = {
  ...window.StorefrontAPI,
  loadLayout,
  loadCategories,
  loadProducts,
  renderCategoryCard,
  renderProductCard,
};


// Hide subcategory UI when a category has no children
window.hideEmptySubcategories = function(container) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;
  const items = el.querySelectorAll('[data-subcategory], .subcategory, .subcat');
  if (!items.length) {
    const block = document.getElementById('subcategory-block') || document.querySelector('.subcategories');
    if (block) block.remove();
  }
};

window.quickAddToCart = async function(variantId) {
  if (!variantId) { alert('Variante indisponible'); return; }
  try {
    if (typeof addToCart === 'function') {
      await addToCart(variantId, 1);
      if (typeof refreshCartBadge === 'function') refreshCartBadge();
      if (typeof showCartToast === 'function') showCartToast('Ajouté au panier', '');
    }
  } catch (err) {
    console.error(err);
    alert("Impossible d'ajouter au panier");
  }
};

window.quickBuy = async function(variantId) {
  if (variantId) await window.quickAddToCart(variantId);
  window.location.href = 'checkout.html';
};
