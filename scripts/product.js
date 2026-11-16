

// ---- extracted from product.html ----

// ---- Product state ----
    let currentQty = 1;

    function showCartToast(title, desc) {
      const toast = document.getElementById('toast-notification');
      const titleEl = document.getElementById('toast-title');
      const descEl = document.getElementById('toast-desc');
      if (titleEl) titleEl.textContent = title || 'Ajouté';
      if (descEl && desc) descEl.textContent = desc;
      if (toast) {
        toast.classList.remove('hidden', 'opacity-0');
        toast.classList.add('opacity-100');
        setTimeout(() => {
          toast.classList.add('opacity-0');
          setTimeout(() => toast.classList.add('hidden'), 300);
        }, 2000);
      } else {
        console.log(title, desc || '');
      }
    }

    let isWishlisted = false;

    // Build the product payload from the page
  function buildProductPayload() {
  return {
    id: 'vpk-500-hd',
    name: 'Mini-dumper sur chenilles hydrostatique 500 kg — Honda GX200 6.5 CV',
    brand: 'VOLKMAN PRO GERMANY',
    sku: 'VPK-500-HD',        // ⚠️ cart.js utilise item.sku, pas item.ref
    price: 3650,               // ← renommé
    qty: currentQty,
    image: document.getElementById('main-product-img')?.src || ''
  };
}

function quickAdd(itemTitle, price) {
  const numericPrice = parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.'));
  const id = 'related-' + itemTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  addToCart({
    id,
    name: itemTitle,
    brand: '',
    sku: 'ACCESSOIRE',         // ← renommé (était ref)
    price: numericPrice,       // ← renommé (était priceHT)
    qty: 1,
    image: ''
  });
  showCartToast(itemTitle);   // signature : showCartToast(nom)
}

    // ---- Media gallery ----
    const mediaList = [
      {type: 'img', label: 'Photo 1 / 6'},
      {type: 'img', label: 'Photo 2 / 6 — Moteur Honda GX200'},
      {type: 'img', label: 'Photo 3 / 6 — Vérin & Basculement'},
      {type: 'img', label: 'Photo 4 / 6 — Poste de commande'},
      {type: 'img', label: 'Photo 5 / 6 — Chenilles haute adhérence'},
      {type: 'video', label: 'Vidéo — Essai Chantier 1:45'}
    ];

    function switchMedia(index, type) {
      const thumbs = document.querySelectorAll('.thumb-btn');
      thumbs.forEach((thumb, idx) => {
        const ind = thumb.querySelector('.thumb-indicator');
        if (idx === index) {
          thumb.classList.add('ring-2', 'ring-primary');
          thumb.classList.remove('ring-0');
          if (ind) ind.classList.replace('bg-transparent', 'bg-primary/10');
        } else {
          thumb.classList.remove('ring-2', 'ring-primary');
          thumb.classList.add('ring-0');
          if (ind) ind.classList.replace('bg-primary/10', 'bg-transparent');
        }
      });
      const videoStage = document.getElementById('video-stage-overlay');
      const counter = document.getElementById('image-counter');
      counter.textContent = mediaList[index].label;
      if (type === 'video') videoStage.classList.remove('hidden');
      else videoStage.classList.add('hidden');
    }

    function closeVideoStage() {
      document.getElementById('video-stage-overlay').classList.add('hidden');
      switchMedia(0, 'img');
    }

    function simulatePlayVideo() {
      showCartToast('Lecture de la vidéo démo...', 'Démonstration chantier BTP du dumper Volkman');
    }

    function handleImageZoom(e) {
      const container = e.currentTarget;
      const img = document.getElementById('main-product-img');
      const overlay = document.getElementById('video-stage-overlay');
      if (!img || !overlay) return;
      if (overlay.classList.contains('hidden')) {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        img.style.transformOrigin = `${x}% ${y}%`;
        img.style.transform = 'scale(1.75)';
      }
    }

    function resetImageZoom() {
      const img = document.getElementById('main-product-img');
      if (!img) return;
      img.style.transform = 'scale(1)';
      img.style.transformOrigin = 'center center';
    }

    // ---- Quantity ----
    function incrementQty() {
      if (currentQty < 8) {
        currentQty++;
        document.getElementById('qty-input').value = currentQty;
      }
    }
    function decrementQty() {
      if (currentQty > 1) {
        currentQty--;
        document.getElementById('qty-input').value = currentQty;
      }
    }

    // ---- Tabs ----
    function switchTab(tabId, btn) {
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
        tab.classList.remove('block');
      });
      document.getElementById(tabId).classList.remove('hidden');
      document.getElementById(tabId).classList.add('block');
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('bg-primary', 'text-on-primary');
        b.classList.add('text-on-surface-variant');
      });
      btn.classList.add('bg-primary', 'text-on-primary');
      btn.classList.remove('text-on-surface-variant');
    }

    // ---- Actions (delegate to cart.js) ----
    async function addToCartAction() {
      const prod = window.__currentProduct;
      const variantId = prod?.variants?.[0]?.id;
      const qty = currentQty || 1;
      console.log('addToCart', { variantId, prod });
      if (!variantId) {
        alert('Variante indisponible. Rechargez la page.');
        return;
      }
      try {
        // Exact same call that returned 201 in the console
        const token = window.StorefrontAPI?.getGuestToken?.();
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Store-Code': 'agri'
        };
        if (token) headers['X-Guest-Cart-Token'] = token;
        const res = await fetch('https://marketplace-app-production-6dae1174.up.railway.app/api/storefront/cart/items', {
          method: 'POST',
          headers,
          body: JSON.stringify({ variant_id: variantId, quantity: qty })
        });
        const text = await res.text();
        if (!res.ok) throw new Error(res.status + ' ' + text);
        const json = JSON.parse(text);
        if (json.guest_token && window.StorefrontAPI?.setGuestToken) {
          StorefrontAPI.setGuestToken(json.guest_token);
        }
        if (typeof refreshCartBadge === 'function') refreshCartBadge();
        showCartToast('Article ajouté au panier', prod.name || '');
        if (typeof refreshHeaderCart === 'function') refreshHeaderCart();
        const btn = document.getElementById('add-to-cart-btn');
        if (btn) {
          const original = btn.innerHTML;
          btn.innerHTML = `<span class="material-symbols-outlined text-tertiary text-[20px]">check_circle</span><span>Ajouté avec succès !</span>`;
          setTimeout(() => { btn.innerHTML = original; }, 1800);
        }
      } catch (err) {
        console.error(err);
        alert('Erreur panier: ' + (err.message || err));
      }
    }

    async function buyNowAction() {
      const prod = window.__currentProduct;
      const variantId = prod?.variants?.[0]?.id;
      const qty = currentQty || 1;
      if (!variantId) {
        alert('Variante indisponible pour ce produit');
        return;
      }
      try {
        const token = window.StorefrontAPI?.getGuestToken?.();
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Store-Code': 'agri'
        };
        if (token) headers['X-Guest-Cart-Token'] = token;
        const res = await fetch('https://marketplace-app-production-6dae1174.up.railway.app/api/storefront/cart/items', {
          method: 'POST',
          headers,
          body: JSON.stringify({ variant_id: variantId, quantity: qty })
        });
        const text = await res.text();
        if (!res.ok) throw new Error(res.status + ' ' + text);
        const json = JSON.parse(text);
        if (json.guest_token && window.StorefrontAPI?.setGuestToken) {
          StorefrontAPI.setGuestToken(json.guest_token);
        }
        showCartToast('Article ajouté — redirection', prod.name || '');
        if (typeof refreshHeaderCart === 'function') refreshHeaderCart();
        setTimeout(() => { window.location.href = 'checkout.html'; }, 500);
      } catch (err) {
        console.error(err);
        alert('Erreur: ' + (err.message || err));
      }
    }

    function toggleWishlist() {
      isWishlisted = !isWishlisted;
      const icon = document.getElementById('wishlist-icon');
      if (isWishlisted) {
        icon.textContent = 'favorite';
        icon.classList.add('text-error');
        showCartToast('Ajouté à vos favoris', 'Matériel enregistré dans votre espace pro');
      } else {
        icon.textContent = 'favorite_border';
        icon.classList.remove('text-error');
      }
    }

    function shareProduct() {
      if (navigator.share) {
        navigator.share({title: 'Mini-dumper Volkman 500 kg sur Strand Pro', url: window.location.href}).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        showCartToast('Lien copié dans le presse-papier', 'Partagez la fiche produit à votre équipe');
      }
    }

    function openMediaFullscreen() {
      const elem = document.getElementById('media-viewport');
      if (!document.fullscreenElement) elem.requestFullscreen().catch(() => {});
      else document.exitFullscreen();
    }

    function scrollRelated(direction) {
      const carousel = document.getElementById('related-carousel');
      carousel.scrollBy({left: direction * 320, behavior: 'smooth'});
    }

    function toggleCategoryDrawer(open) {
      const drawer = document.getElementById('category-drawer');
      const backdrop = document.getElementById('category-drawer-backdrop');
      if (!drawer || !backdrop) return;
      if (open) {
        backdrop.classList.remove('hidden');
        requestAnimationFrame(() => {
          backdrop.classList.remove('opacity-0');
          drawer.classList.remove('-translate-x-full');
        });
        document.body.style.overflow = 'hidden';
      } else {
        drawer.classList.add('-translate-x-full');
        backdrop.classList.add('opacity-0');
        setTimeout(() => backdrop.classList.add('hidden'), 300);
        document.body.style.overflow = '';
      }
    }

    // Make sure badge reflects cart on load
    document.addEventListener('DOMContentLoaded', () => { if (typeof refreshCartBadge === 'function') refreshCartBadge(); else if (typeof renderCartBadge === 'function') renderCartBadge(); });

function goToCheckout() {
  window.location.href = 'checkout.html';
}

async function refreshHeaderCart() {
  try {
    const token = window.StorefrontAPI?.getGuestToken?.();
    const headers = { 'Accept': 'application/json', 'X-Store-Code': 'agri' };
    if (token) headers['X-Guest-Cart-Token'] = token;
    const res = await fetch('https://marketplace-app-production-6dae1174.up.railway.app/api/storefront/cart', { headers });
    if (!res.ok) return;
    const data = await res.json();
    const items = data.cart?.items || [];
    const count = items.reduce((s, i) => s + (i.quantity || 1), 0);
    const total = data.totals?.subtotal || 0;
    const badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count;
    const totalEl = document.getElementById('cart-total');
    if (totalEl && window.StorefrontAPI?.formatPrice) totalEl.textContent = StorefrontAPI.formatPrice(total);
    const headerTotal = document.querySelector('[data-path="panier"] .font-numeric-data');
    if (headerTotal && window.StorefrontAPI?.formatPrice) headerTotal.textContent = StorefrontAPI.formatPrice(total);
    // drawer items
    const itemsEl = document.getElementById('cart-items');
    if (itemsEl) {
      if (!items.length) {
        itemsEl.innerHTML = '<div class="text-center text-secondary py-8">Votre panier est vide</div>';
      } else {
        itemsEl.innerHTML = items.map(it => {
          const v = it.variant || {};
          const name = v.variant_name || v.sku || 'Produit';
          const price = it.unit_price ?? v.price ?? 0;
          return `<div class="flex justify-between gap-3 p-3 bg-surface-container-low rounded-lg">
            <div><div class="font-semibold">${name}</div><div class="text-sm text-secondary">Qté: ${it.quantity}</div></div>
            <div class="font-bold">${window.StorefrontAPI?.formatPrice ? StorefrontAPI.formatPrice(price) : price + ' €'}</div>
          </div>`;
        }).join('');
      }
    }
  } catch (e) { console.info('cart refresh failed', e); }
}

function toggleCartDrawer(open) {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-drawer-backdrop');
  if (!drawer || !backdrop) return;
  if (open) {
    backdrop.classList.remove('hidden');
    requestAnimationFrame(() => {
      backdrop.classList.remove('opacity-0');
      drawer.classList.remove('translate-x-full');
    });
    document.body.style.overflow = 'hidden';
  } else {
    drawer.classList.add('translate-x-full');
    backdrop.classList.add('opacity-0');
    setTimeout(() => backdrop.classList.add('hidden'), 300);
    document.body.style.overflow = '';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof refreshHeaderCart === 'function') refreshHeaderCart();
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug') || params.get('id');

  // Always hide Avis / reviews tab
  document.querySelectorAll('[onclick*="tab-reviews"]').forEach(btn => btn.remove());
  const reviewsTab = document.getElementById('tab-reviews');
  if (reviewsTab) reviewsTab.remove();

  if (!slug || !window.StorefrontAPI) return;

  try {
    const json = await StorefrontAPI.api(`/storefront/products/${encodeURIComponent(slug)}`);
    const p = json.data || json;
    window.__currentProduct = p;
    const variant = p.variants?.[0] || {};
    const price = variant.price ?? p.price ?? 0;
    const brand = p.brand?.name || '';
    const category = p.category || {};
    const sku = variant.sku || '';
    const desc = p.description || '';
    const media = Array.isArray(p.media) ? p.media : [];

    // Main image + gallery — real media only, otherwise "aucune image"
    const mainImg = document.getElementById('main-product-img');
    const mediaViewport = document.getElementById('media-viewport');
    if (!media.length) {
      if (mainImg) mainImg.remove();
      if (mediaViewport) {
        mediaViewport.innerHTML = `<div class="w-full h-full flex items-center justify-center text-on-surface-variant text-sm">Aucune image</div>`;
      }
      document.querySelectorAll('.thumb-btn').forEach(t => t.remove());
    } else {
      const firstSrc = StorefrontAPI.mediaUrl(media[0]);
      if (mainImg && firstSrc) {
        mainImg.src = firstSrc;
        mainImg.alt = p.name || '';
      }
      const thumbContainer = document.querySelector('.thumb-btn')?.parentElement;
      if (thumbContainer) {
        if (media.length > 1) {
          thumbContainer.innerHTML = media.map((m, i) => {
            const src = StorefrontAPI.mediaUrl(m);
            return `<button type="button" class="thumb-btn group relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-container-low shadow-sm ${i===0?'ring-2 ring-primary':''}" onclick="document.getElementById('main-product-img').src='${src}'">
              <img src="${src}" alt="" class="w-full h-full object-cover" />
            </button>`;
          }).join('');
        } else {
          thumbContainer.querySelectorAll('.thumb-btn').forEach(t => t.remove());
        }
      }
    }

    // Title
    const h1 = document.querySelector('h1');
    if (h1 && p.name) h1.textContent = p.name;

    // Price HT
    const priceEl = document.getElementById('price-ht');
    if (priceEl) priceEl.textContent = StorefrontAPI.formatPrice(price).replace('€', '').trim() + ' €';

    // TTC = HT * 1.20 — update only the #price-ttc element
    const ttc = price * 1.20;
    const ttcEl = document.getElementById('price-ttc');
    if (ttcEl) {
      ttcEl.textContent = StorefrontAPI.formatPrice(ttc);
    }

    // Crossed price only if compare_at_price exists
    const compare = variant.compare_at_price ?? p.compare_at_price ?? null;
    const crossedEl = document.getElementById('crossed-price');
    if (crossedEl) {
      if (compare && Number(compare) > Number(price)) {
        crossedEl.textContent = StorefrontAPI.formatPrice(compare).replace('€', '').trim() + ' € HT';
        crossedEl.style.display = '';
      } else {
        crossedEl.style.display = 'none';
        // also hide the promo badge next to it if present
        const badge = crossedEl.parentElement?.querySelector('.bg-primary, [class*="PRO"]');
        if (badge) badge.style.display = 'none';
      }
    }

    // Stable "unités vendues" per product (same every visit, no year)
    const soldSeed = (p.id || p.slug || slug).toString();
    let hash = 0;
    for (let i = 0; i < soldSeed.length; i++) hash = ((hash << 5) - hash) + soldSeed.charCodeAt(i);
    const sold = 40 + Math.abs(hash % 280); // 40–319
    document.querySelectorAll('span, p').forEach(el => {
      if (el.textContent.includes('unités vendues') || el.textContent.includes('vendues en')) {
        el.textContent = `${sold} unités vendues`;
      }
    });

    // 3 feature bullets from attributes (or hide the list)
    const attrs = p.attribute_values || p.attributeValues || [];
    const featureList = document.querySelector('.flex.flex-col.gap-3') || null;
    // find the container that holds the 4 dummy feature rows
    const featureRows = Array.from(document.querySelectorAll('.flex.items-start.gap-3')).filter(r => r.querySelector('strong'));
    if (featureRows.length) {
      const parent = featureRows[0].parentElement;
      if (Array.isArray(attrs) && attrs.length) {
        // deterministic pick of 3 based on product id
        const shuffled = [...attrs].sort((a, b) => {
          const ka = (a.definition?.code || a.id || '').toString();
          const kb = (b.definition?.code || b.id || '').toString();
          return (ka + soldSeed).localeCompare(kb + soldSeed);
        }).slice(0, 3);
        parent.innerHTML = shuffled.map(av => {
          const label = av.definition?.label || av.definition?.code || 'Caractéristique';
          const val = av.value_text ?? av.value_integer ?? av.value_decimal ?? (av.value_boolean != null ? (av.value_boolean ? 'Oui' : 'Non') : '') ?? av.value_date ?? '';
          return `<div class="flex items-start gap-3">
            <div class="w-6 h-6 rounded bg-surface-container text-primary flex items-center justify-center shrink-0 mt-0.5">
              <span class="material-symbols-outlined text-[16px]">check</span>
            </div>
            <span class="font-body-md text-body-md text-on-surface"><strong>${label} :</strong> ${val}</span>
          </div>`;
        }).join('');
      } else {
        parent.innerHTML = `<p class="text-on-surface-variant text-sm">Aucune caractéristique pour ce produit.</p>`;
      }
    }

    // Brand
    const brandStrong = document.querySelector('span.font-body-sm strong');
    if (brandStrong) brandStrong.textContent = brand || '—';

    // Breadcrumb: Accueil / Category / Product
    const crumb = document.getElementById('product-breadcrumb');
    if (crumb) {
      const catName = category.name || 'Catégorie';
      const catSlug = category.slug || '';
      const catHref = catSlug ? `category.html?category=${encodeURIComponent(catSlug)}` : 'category.html';
      const prodName = p.name || 'Produit';
      crumb.innerHTML = `
        <a class="hover:text-primary transition-colors flex items-center gap-1" href="index.html">
          <span class="material-symbols-outlined text-[16px]">home</span>
          <span>Accueil</span>
        </a>
        <span class="text-outline-variant">/</span>
        <a class="hover:text-primary transition-colors" href="${catHref}">${catName}</a>
        <span class="text-outline-variant">/</span>
        <span class="text-on-surface font-semibold truncate max-w-xs sm:max-w-none">${prodName}</span>
      `;
    }

    // Description tab
    const descTab = document.getElementById('tab-desc');
    if (descTab) {
      const box = descTab.querySelector('.max-w-4xl') || descTab;
      if (desc) {
        box.innerHTML = `<div class="prose max-w-none text-on-surface leading-relaxed">${desc.replace(/\n/g, '<br>')}</div>`;
      } else {
        box.innerHTML = `<p class="text-on-surface-variant">Aucune description pour ce produit.</p>`;
      }
    }

    // Specs / attributes tab — only real attributes
    const specsTab = document.getElementById('tab-specs');
    if (specsTab) {
      const attrs = p.attribute_values || p.attributeValues || [];
      if (Array.isArray(attrs) && attrs.length) {
        const rows = attrs.map(av => {
          const label = av.definition?.label || av.definition?.code || 'Attribut';
          const val = av.value_text ?? av.value_integer ?? av.value_decimal ?? (av.value_boolean != null ? (av.value_boolean ? 'Oui' : 'Non') : '') ?? av.value_date ?? '';
          return `<tr class="border-b border-outline-variant/40"><td class="py-3 pr-6 font-semibold text-on-surface">${label}</td><td class="py-3 text-on-surface">${val}</td></tr>`;
        }).join('');
        specsTab.innerHTML = `<div class="bg-surface-container-lowest p-6 sm:p-10 rounded-2xl shadow-sm"><table class="w-full">${rows}</table></div>`;
      } else {
        specsTab.innerHTML = `<div class="bg-surface-container-lowest p-10 rounded-2xl text-center text-on-surface-variant">Aucune caractéristique pour ce produit.</div>`;
      }
    }

    // Related products from same category
    const relatedEl = document.getElementById('related-carousel');
    if (relatedEl && category.slug) {
      try {
        const relJson = await StorefrontAPI.api(`/storefront/products?category=${encodeURIComponent(category.slug)}&limit=6`);
        const list = (relJson.data || relJson || []).filter(x => x.slug !== slug).slice(0, 5);
        if (list.length) {
          relatedEl.innerHTML = list.map(rp => {
            const rimg = StorefrontAPI.mediaUrl(rp.media?.[0]) || StorefrontAPI.PLACEHOLDER;
            const rprice = rp.variants?.[0]?.price ?? rp.price ?? 0;
            const rhref = `product.html?slug=${encodeURIComponent(rp.slug)}`;
            return `<a href="${rhref}" class="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col group hover:shadow-md transition-shadow">
              <div class="relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-container-low mb-3">
                <img src="${rimg}" alt="${rp.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <h3 class="font-semibold text-on-surface leading-snug line-clamp-2">${rp.name}</h3>
              <p class="mt-2 font-bold text-primary">${StorefrontAPI.formatPrice(rprice)}</p>
            </a>`;
          }).join('');
        } else {
          relatedEl.innerHTML = `<p class="text-on-surface-variant col-span-full">Aucun autre produit dans cette catégorie.</p>`;
        }
      } catch (e) {
        relatedEl.innerHTML = `<p class="text-on-surface-variant col-span-full">Produits similaires indisponibles.</p>`;
      }
    }

  } catch (err) {
    console.info('Product API not available, keeping local content:', err.message);
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
