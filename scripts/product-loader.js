// Load real product by slug and populate the page
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug || !window.StorefrontAPI) return;

  try {
    const product = await StorefrontAPI.api('/storefront/products/' + encodeURIComponent(slug));
    if (!product || !product.name) return;

    const variant = product.variants?.[0] || {};
    const price = Number(variant.price ?? product.price ?? 0);
    const compare = variant.compare_at_price ?? product.compare_at_price ?? null;
    const img = StorefrontAPI.mediaUrl(product.media?.[0]) || product.image || '';

    // Title
    const h1 = document.querySelector('h1');
    if (h1) h1.textContent = product.name;
    const titleMobile = document.getElementById('product-title-mobile');
    if (titleMobile) titleMobile.textContent = product.name;

    // Brand
    const brandEl = document.querySelector('strong');
    if (brandEl && product.brand?.name) brandEl.textContent = product.brand.name;
    const brandMobile = document.getElementById('product-brand-mobile');
    if (brandMobile && product.brand?.name) brandMobile.textContent = product.brand.name;

    // Prices
    const priceHt = document.getElementById('price-ht');
    if (priceHt) priceHt.textContent = StorefrontAPI.formatPrice(price);
    const priceHtMobile = document.getElementById('price-ht-mobile');
    if (priceHtMobile) priceHtMobile.textContent = StorefrontAPI.formatPrice(price) + ' HT';
    const stickyHt = document.getElementById('sticky-price-ht-mobile');
    if (stickyHt) stickyHt.textContent = StorefrontAPI.formatPrice(price);

    const priceTtc = document.getElementById('price-ttc');
    if (priceTtc) priceTtc.textContent = StorefrontAPI.formatPrice(price * 1.2);
    const priceTtcMobile = document.getElementById('price-ttc-mobile');
    if (priceTtcMobile) priceTtcMobile.textContent = 'Soit ' + StorefrontAPI.formatPrice(price * 1.2) + ' TTC';
    const stickyTtc = document.getElementById('sticky-price-ttc-mobile');
    if (stickyTtc) stickyTtc.textContent = 'TTC : ' + StorefrontAPI.formatPrice(price * 1.2);

    const crossed = document.getElementById('crossed-price');
    if (crossed) {
      if (compare && compare > price) {
        crossed.textContent = StorefrontAPI.formatPrice(compare) + ' HT';
        crossed.classList.remove('hidden');
      } else {
        crossed.classList.add('hidden');
      }
    }

    // Main image
    const mainImg = document.getElementById('main-product-img');
    if (mainImg && img) mainImg.src = img;
    const mainImgMobile = document.getElementById('main-product-img-mobile');
    if (mainImgMobile && img) mainImgMobile.src = img;

    // Breadcrumb last item
    const bc = document.getElementById('product-breadcrumb');
    if (bc) {
      const last = bc.querySelector('span:last-child, a:last-child');
      if (last) last.textContent = product.name;
    }
    // Category badge
    const catBadge = document.getElementById('product-category-badge-mobile');
    if (catBadge && product.category?.name) catBadge.textContent = product.category.name.toUpperCase();

    // Stock status
    const stockEl = document.getElementById('stock-status-mobile');
    if (stockEl) {
      const inv = variant.inventory;
      const inStock = inv ? ((inv.on_hand || 0) - (inv.reserved || 0)) > 0 : true;
      stockEl.innerHTML = inStock
        ? `<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span><span class="font-label-lg text-[13px] text-tertiary font-semibold">En stock</span></div>`
        : `<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-error"></span><span class="font-label-lg text-[13px] text-error font-semibold">Sur commande</span></div>`;
    }

    // Key specs (from description excerpt or attributes)
    const specsList = document.getElementById('key-specs-list-mobile');
    if (specsList) {
      let items = [];
      if (product.attribute_values && product.attribute_values.length) {
        items = product.attribute_values.slice(0, 4).map(av => av.value_text || av.value_integer || av.value_decimal).filter(Boolean);
      } else if (product.description) {
        items = product.description.split(/[.\n]/).filter(s => s.trim().length > 20).slice(0, 3);
      }
      if (items.length) {
        specsList.innerHTML = items.map(text => `<li class="flex items-start gap-2"><span class="material-symbols-outlined text-primary text-[16px] mt-0.5">check_circle</span><span>${text.trim()}</span></li>`).join('');
      } else {
        specsList.innerHTML = '<li class="text-secondary">Caractéristiques détaillées disponibles sur demande.</li>';
      }
    }

    // Full description
    const descEl = document.getElementById('description-content-mobile');
    if (descEl) {
      descEl.innerHTML = product.description
        ? product.description.replace(/\n/g, '<br>')
        : 'Aucune description disponible.';
    }

    // Full characteristics / attributes
    const charsList = document.getElementById('characteristics-list-mobile');
    if (charsList) {
      if (product.attribute_values && product.attribute_values.length) {
        charsList.innerHTML = product.attribute_values.map(av => {
          const label = (av.definition && av.definition.label) || av.attribute?.name || 'Caractéristique';
          const value = av.value_text ?? av.value_integer ?? av.value_decimal ?? av.value ?? '—';
          return `<div class="flex justify-between gap-2 py-1 border-b border-surface-container-highest/40 last:border-0"><span class="text-secondary">${label}</span><span class="font-semibold text-on-surface text-right">${value}</span></div>`;
        }).join('');
      } else {
        charsList.innerHTML = '<div class="text-secondary">Aucune caractéristique détaillée.</div>';
      }
    }

    // Gallery thumbs
    const thumbsContainer = document.getElementById('gallery-thumbs-mobile');
    if (thumbsContainer && product.media && product.media.length) {
      thumbsContainer.innerHTML = product.media.slice(0, 6).map((m, i) => {
        const src = StorefrontAPI.mediaUrl(m);
        return `<button class="flex-shrink-0 w-16 h-16 rounded overflow-hidden p-0.5 ${i === 0 ? 'bg-primary' : 'bg-surface-container'}" onclick="document.getElementById('main-product-img-mobile').src='${src}'; document.getElementById('gallery-counter-mobile').textContent='Photo ${i+1} / ${Math.min(product.media.length,6)}'"><img class="w-full h-full object-cover" src="${src}" alt=""/></button>`;
      }).join('');
      const counter = document.getElementById('gallery-counter-mobile');
      if (counter) counter.textContent = `Photo 1 / ${Math.min(product.media.length, 6)}`;
    }

    // Related products
    const relatedEl = document.getElementById('related-products-mobile');
    if (relatedEl && product.category) {
      try {
        const related = await StorefrontAPI.api('/storefront/products?category=' + encodeURIComponent(product.category.slug) + '&limit=6');
        const list = Array.isArray(related) ? related : (related.data || []);
        relatedEl.innerHTML = list.filter(p => p.id !== product.id).slice(0, 5).map(p => {
          const pImg = StorefrontAPI.mediaUrl(p.media?.[0]) || StorefrontAPI.PLACEHOLDER;
          const pPrice = Number(p.variants?.[0]?.price ?? p.price ?? 0);
          return `<a href="product.html?slug=${encodeURIComponent(p.slug)}" class="w-48 flex-shrink-0 p-3 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-2">
            <div class="aspect-[4/3] rounded-lg overflow-hidden bg-surface-container"><img class="w-full h-full object-cover" src="${pImg}" alt=""/></div>
            <span class="font-label-md text-[12px] text-on-surface font-semibold line-clamp-2">${p.name}</span>
            <span class="font-headline-sm text-[14px] text-on-surface font-bold">${StorefrontAPI.formatPrice(pPrice)} HT</span>
          </a>`;
        }).join('');
      } catch (e) { /* ignore related load failure */ }
    }

    // Update document title
    document.title = product.name + ' — JS Europe';
    const loader = document.getElementById('product-loading');
    if (loader) loader.remove();

    // Store for cart
    window.currentProduct = {
      id: variant.id || product.id,
      name: product.name,
      brand: product.brand?.name || '',
      price: price,
      image: img,
      slug: product.slug,
    };
  } catch (err) {
    console.error('Product load failed:', err);
    const loader = document.getElementById('product-loading');
    if (loader) loader.remove();
  }
});
