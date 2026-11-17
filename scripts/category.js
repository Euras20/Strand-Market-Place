

// ---- extracted from category.html ----

const CART_KEY = 'strand_cart_v1';
    function getCart() {try {return JSON.parse(localStorage.getItem(CART_KEY)) || [];} catch (e) {return [];} }
    function saveCart(c) {localStorage.setItem(CART_KEY, JSON.stringify(c)); renderCartBadge(); renderCartDrawer();}
    function cartCount() {return getCart().reduce((s, i) => s + (i.qty || 1), 0);}
    function cartTotalHT() {return getCart().reduce((s, i) => s + (i.priceHT * (i.qty || 1)), 0);}
    function addToCart(p) {const c = getCart(); const e = c.find(i => i.id === p.id); if (e) {e.qty = (e.qty || 1) + (p.qty || 1);} else {c.push({...p, qty: p.qty || 1});} saveCart(c);}
    function removeFromCart(id) {saveCart(getCart().filter(i => i.id !== id));}
    function updateQty(id, d) {const c = getCart(); const it = c.find(i => i.id === id); if (!it) return; it.qty = Math.max(1, (it.qty || 1) + d); saveCart(c);}
    function fmtEUR(n) {return new Intl.NumberFormat('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(n) + ' €';}
    function renderCartBadge() {
      const n = cartCount(), t = cartTotalHT();
      document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = n);
      document.querySelectorAll('[data-cart-total]').forEach(el => el.textContent = fmtEUR(t));
    }
    function renderCartDrawer() {
      const itemsEl = document.getElementById('cart-items'); const totalEl = document.getElementById('cart-total');
      if (!itemsEl) return;
      const cart = getCart();
      if (cart.length === 0) {
        itemsEl.innerHTML = `<div class="text-center text-secondary py-12 flex flex-col items-center gap-3"><span class="material-symbols-outlined text-[48px] text-outline-variant">shopping_bag</span><p class="font-body-md">Votre panier est vide</p><a href="strand.html" class="text-primary font-label-md font-semibold hover:underline">Découvrir le catalogue</a></div>`;
      } else {
        itemsEl.innerHTML = cart.map(it => `
      <div class="flex gap-3 p-3 bg-surface-container-low rounded-lg">
        <div class="w-16 h-16 rounded-lg overflow-hidden bg-surface-container shrink-0">${it.image ? `<img src="${it.image}" alt="" class="w-full h-full object-cover"/>` : ''}</div>
        <div class="flex-1 min-w-0">
          <div class="font-label-caps text-[10px] text-secondary uppercase">${it.brand || ''}</div>
          <div class="font-title-md text-on-surface leading-tight">${it.name}</div>
          <div class="text-[11px] text-secondary mt-0.5">Réf. ${it.ref || '—'}</div>
          <div class="flex items-center justify-between mt-2">
            <div class="flex items-center bg-surface-container-lowest rounded-lg">
              <button class="w-7 h-7 flex items-center justify-center hover:bg-surface-container rounded-l-lg" onclick="updateQty('${it.id}',-1)" type="button">−</button>
              <span class="w-8 text-center font-numeric-data text-[13px] font-bold">${it.qty}</span>
              <button class="w-7 h-7 flex items-center justify-center hover:bg-surface-container rounded-r-lg" onclick="updateQty('${it.id}',1)" type="button">+</button>
            </div>
            <div class="text-right"><div class="font-title-md font-bold">${fmtEUR(it.priceHT * it.qty)}</div><div class="text-[10px] text-secondary">HT</div></div>
          </div>
        </div>
        <button class="text-secondary hover:text-error self-start" onclick="removeFromCart('${it.id}')" type="button"><span class="material-symbols-outlined text-[18px]">close</span></button>
      </div>`).join('');
      }
      if (totalEl) totalEl.textContent = fmtEUR(cartTotalHT());
    }
    function toggleCartDrawer(open) {
      const dr = document.getElementById('cart-drawer'), bd = document.getElementById('cart-drawer-backdrop');
      if (!dr || !bd) return;
      if (open) {renderCartDrawer(); bd.classList.remove('hidden'); requestAnimationFrame(() => {bd.classList.remove('opacity-0'); dr.classList.remove('translate-x-full');}); document.body.style.overflow = 'hidden';}
      else {dr.classList.add('translate-x-full'); bd.classList.add('opacity-0'); setTimeout(() => bd.classList.add('hidden'), 300); document.body.style.overflow = '';}
    }
    function toggleCategoryDrawer(open) {
      const dr = document.getElementById('category-drawer'), bd = document.getElementById('category-drawer-backdrop');
      if (!dr || !bd) return;
      if (open) {bd.classList.remove('hidden'); requestAnimationFrame(() => {bd.classList.remove('opacity-0'); dr.classList.remove('-translate-x-full');}); document.body.style.overflow = 'hidden';}
      else {dr.classList.add('-translate-x-full'); bd.classList.add('opacity-0'); setTimeout(() => bd.classList.add('hidden'), 300); document.body.style.overflow = '';}
    }
    function buyNow(p) {addToCart({...p, qty: p.qty || 1}); window.location.href = 'checkout.html';}
    function showCartToast(title, message) {
      let t = document.getElementById('global-toast');
      if (!t) {
        t = document.createElement('div'); t.id = 'global-toast';
        t.className = 'fixed bottom-6 right-6 z-[100] transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none';
        t.innerHTML = `<div class="bg-[#252A2D] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 max-w-md"><span class="material-symbols-outlined text-primary text-[24px]">check_circle</span><div><p class="font-title-md font-semibold" data-tt></p><p class="font-body-sm text-secondary-fixed-dim" data-tm></p></div></div>`;
        document.body.appendChild(t);
      }
      t.querySelector('[data-tt]').textContent = title; t.querySelector('[data-tm]').textContent = message;
      t.classList.remove('translate-y-24', 'opacity-0'); t.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {t.classList.add('translate-y-24', 'opacity-0'); t.classList.remove('translate-y-0', 'opacity-100');}, 3200);
    }
    function toggleWishlist(btn, name) {
      const icon = btn.querySelector('.material-symbols-outlined');
      const saved = icon.style.fontVariationSettings && icon.style.fontVariationSettings.includes('FILL 1');
      if (saved) {icon.style.fontVariationSettings = "'FILL' 0"; icon.classList.remove('text-primary'); icon.classList.add('text-secondary'); showCartToast('Favoris', name + ' retiré');}
      else {icon.style.fontVariationSettings = "'FILL' 1"; icon.classList.remove('text-secondary'); icon.classList.add('text-primary'); showCartToast('Favoris', name + ' ajouté');}
    }
    document.addEventListener('DOMContentLoaded', () => {renderCartBadge(); renderCartDrawer();});

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category') || params.get('cat');
  const sort = params.get('sort');
  const limit = params.get('limit');
  const minPrice = params.get('min_price') || params.get('price_gte');
  const promo = params.get('promo') === '1' || params.get('is_promo') === '1';

  if (window.StorefrontAPI && (category || sort || limit || minPrice || promo)) {
    const grid = document.getElementById('product-grid');
    if (grid) grid.innerHTML = '';

    await StorefrontAPI.loadProducts({
      containerId: 'product-grid',
      category: category || null,
      sort: sort || null,
      limit: limit ? Number(limit) : null,
      minPrice: minPrice ? Number(minPrice) : null,
      promo: promo || null,
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (window.StorefrontAPI?.refreshCartBadge) StorefrontAPI.refreshCartBadge();
});

// Prefer server cart drawer when API is available
(function () {
  const original = window.toggleCartDrawer;
  window.toggleCartDrawer = async function (open) {
    if (open && window.StorefrontAPI?.syncCartDrawer) {
      await StorefrontAPI.syncCartDrawer();
    }
    if (typeof original === 'function') original(open);
  };
})();

function applyFilters() {
  const params = new URLSearchParams(location.search);
  const price = document.querySelector('.price-filter:checked');
  if (price) {
    if (price.dataset.min) params.set('min_price', price.dataset.min);
    if (price.dataset.max) params.set('max_price', price.dataset.max);
  } else {
    params.delete('min_price');
    params.delete('max_price');
  }
  const brand = document.querySelector('.brand-filter:checked');
  if (brand) params.set('brand', brand.value);
  else params.delete('brand');
  location.search = params.toString();
}
document.querySelectorAll('.price-filter, .brand-filter').forEach(el => {
  el.addEventListener('change', () => {
    document.querySelectorAll('.price-filter').forEach(o => { if (o !== el) o.checked = false; });
    applyFilters();
  });
});

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.StorefrontAPI) return;
  const params = new URLSearchParams(location.search);
  const slug = params.get('category') || params.get('cat');

  // Title + breadcrumb from DB
  if (slug) {
    try {
      const cats = await StorefrontAPI.api('/storefront/categories');
      const list = Array.isArray(cats) ? cats : (cats.data || []);
      const cat = list.find(c => c.slug === slug);
      if (cat) {
        const title = document.getElementById('category-title');
        if (title) title.textContent = cat.name;
        document.title = cat.name + ' | Strand';
        const bc = document.getElementById('breadcrumb');
        if (bc) bc.textContent = 'Accueil / ' + cat.name;
      }
    } catch (e) {}
  }

  async function reload() {
    const brand = document.querySelector('.brand-filter:checked')?.value || null;
    const price = document.querySelector('.price-filter:checked');
    const grid = document.getElementById('product-grid');
    if (grid) grid.innerHTML = '';
    await StorefrontAPI.loadProducts({
      containerId: 'product-grid',
      category: slug,
      brand,
      minPrice: price ? Number(price.dataset.min) : null,
      maxPrice: price ? Number(price.dataset.max) : null,
    });
    const n = grid ? grid.children.length : 0;
    const count = document.getElementById('product-count');
    if (count) count.textContent = n + ' produit' + (n > 1 ? 's' : '');

    // Brands from the products just loaded, first time only
    const box = document.getElementById('brand-filters');
    if (box && !box.dataset.ready) {
      const names = [...new Set([...grid.querySelectorAll('[data-brand]')].map(el => el.dataset.brand).filter(Boolean))];
      if (names.length) {
        box.innerHTML = names.map(n => `<label class="flex items-center gap-2"><input type="checkbox" class="accent-primary brand-filter" value="${n}"> ${n}</label>`).join('');
        box.dataset.ready = '1';
        box.querySelectorAll('input').forEach(i => i.addEventListener('change', () => { box.querySelectorAll('input').forEach(o => { if (o !== i) o.checked = false; }); reload(); }));
      } else {
        box.innerHTML = '<span class="text-secondary">Aucune marque</span>';
        box.dataset.ready = '1';
      }
    }
  }

  document.querySelectorAll('.price-filter').forEach(i => i.addEventListener('change', () => {
    document.querySelectorAll('.price-filter').forEach(o => { if (o !== i) o.checked = false; });
    reload();
  }));

  // tag brand on cards after first load
  const orig = StorefrontAPI.renderProductCard;
  StorefrontAPI.renderProductCard = function (product) {
    const html = orig(product);
    const brand = product.brand?.name || '';
    return html.replace('class="group ', `data-brand="${brand}" class="group `);
  };

  await reload();
});

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.StorefrontAPI) return;
  const params = new URLSearchParams(location.search);
  const slug = params.get('category') || params.get('cat');
  const q = params.get('q') || '';
  const grid = document.getElementById('product-grid');
  const count = document.getElementById('product-count');
  let all = [];

  if (slug) {
    try {
      const cats = await StorefrontAPI.api('/storefront/categories');
      const list = Array.isArray(cats) ? cats : (cats.data || []);
      const cat = list.find(c => c.slug === slug);
      if (cat) {
        const title = document.getElementById('category-title');
        if (title) title.textContent = cat.name;
        document.title = cat.name;
        const bc = document.getElementById('breadcrumb');
        if (bc) bc.textContent = 'Accueil / ' + cat.name;
      }
    } catch (e) {}
  } else if (q) {
    const title = document.getElementById('category-title');
    if (title) title.textContent = 'Recherche : ' + q;
  }

  const path = '/storefront/products' + (slug ? '?category=' + encodeURIComponent(slug) : (q ? '?q=' + encodeURIComponent(q) : ''));
  try {
    const json = await StorefrontAPI.api(path);
    all = Array.isArray(json) ? json : (json.data || []);
  } catch (e) { all = []; }

  function priceOf(p) {
    const v = p.variants?.[0];
    return Number(v?.price ?? p.price ?? 0);
  }
  function chars(p) {
    return (p.attribute_values || p.attributeValues || []).map(av => ({
      name: av.definition?.name || av.definition_name || 'Caractéristique',
      value: String(av.value_text ?? av.value_integer ?? av.value_decimal ?? ''),
    })).filter(c => c.value);
  }

  function buildFilters() {
    const brands = [...new Set(all.map(p => p.brand?.name).filter(Boolean))];
    const box = document.getElementById('brand-filters');
    if (box) {
      box.innerHTML = brands.length
        ? brands.map(n => `<label class="flex items-center gap-2"><input type="checkbox" class="accent-primary brand-filter" value="${n}"> ${n}</label>`).join('')
        : '<span class="text-secondary text-sm">Aucune marque</span>';
    }
    // Attribute filters (dimension, taille, etc.)
    const groups = {};
    all.forEach(p => chars(p).forEach(c => { (groups[c.name] ||= new Set()).add(c.value); }));
    const aside = document.querySelector('aside');
    if (aside) {
      aside.querySelectorAll('[data-attr-filter]').forEach(el => el.remove());
      Object.entries(groups).slice(0, 4).forEach(([name, values]) => {
        const div = document.createElement('div');
        div.className = 'bg-surface-container-lowest rounded-xl p-4 shadow-sm';
        div.dataset.attrFilter = name;
        div.innerHTML = `<h3 class="font-title-md font-semibold mb-3">${name}</h3><div class="space-y-2 font-body-sm">` +
          [...values].slice(0, 8).map(v => `<label class="flex items-center gap-2"><input type="checkbox" class="accent-primary attr-filter" data-name="${name}" value="${v}"> ${v}</label>`).join('') +
          `</div>`;
        aside.appendChild(div);
      });
    }
    document.querySelectorAll('.brand-filter, .price-filter, .attr-filter').forEach(i => {
      i.addEventListener('change', () => {
        if (i.classList.contains('price-filter') || i.classList.contains('brand-filter')) {
          const cls = i.classList.contains('price-filter') ? '.price-filter' : '.brand-filter';
          document.querySelectorAll(cls).forEach(o => { if (o !== i) o.checked = false; });
        }
        apply();
      });
    });
  }

  function apply() {
    const brand = document.querySelector('.brand-filter:checked')?.value;
    const price = document.querySelector('.price-filter:checked');
    const attrs = [...document.querySelectorAll('.attr-filter:checked')].map(i => ({ name: i.dataset.name, value: i.value }));
    let list = all.slice();
    if (q && !slug) {
      const n = q.toLowerCase();
      list = list.filter(p => (p.name || '').toLowerCase().includes(n));
    }
    if (brand) list = list.filter(p => p.brand?.name === brand);
    if (price) {
      const min = Number(price.dataset.min), max = Number(price.dataset.max);
      list = list.filter(p => { const pr = priceOf(p); return pr >= min && pr <= max; });
    }
    attrs.forEach(a => {
      list = list.filter(p => chars(p).some(c => c.name === a.name && c.value === a.value));
    });
    if (grid) {
      grid.innerHTML = list.map(p => StorefrontAPI.renderProductCard(p)).join('');
    }
    if (count) count.textContent = list.length + ' produit' + (list.length > 1 ? 's' : '');
  }

  buildFilters();
  apply();
});

// Load real products from API
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category') || params.get('cat') || '';
  const q = params.get('q') || '';

  const titleEl = document.getElementById('category-title');
  if (titleEl && category) {
    titleEl.textContent = category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  const grid = document.getElementById('product-grid');
  if (grid && window.StorefrontAPI?.loadProducts) {
    grid.innerHTML = '<div class="col-span-full text-center py-12 text-secondary">Chargement…</div>';
    try {
      await StorefrontAPI.loadProducts({
        containerId: 'product-grid',
        category: category || undefined,
        q: q || undefined,
        limit: 24,
      });
    } catch (e) {
      grid.innerHTML = '<div class="col-span-full text-center py-12 text-error">Impossible de charger les produits.</div>';
    }
  }
});
